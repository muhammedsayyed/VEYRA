/**
 * Batch expander: merges compact recipe rows into the per-country JSON files.
 *
 * Row format (positional):
 * [slug, name, description, categories[], dietType,
 *  [[name, quantity, unit, note?], ...],
 *  ["step one", "step two", ...],
 *  [protein, carbs, fat, fiber, sugar, sodium, saturatedFat],   // calories auto-derived
 *  optional extras object]
 *
 * Calories are derived from macros so the validator's plausibility rule always
 * holds. Merged recipes are appended to prisma/seed-data/recipes/<country>.json
 * and the consumed batch file is deleted, keeping recipes/*.json the single source.
 *
 * Usage: node scripts/build-batch.mjs <batch-file>
 */

import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'prisma', 'seed-data');
const RECIPES_DIR = join(DATA_DIR, 'recipes');
const BATCH_ARG = process.argv[2];
if (!BATCH_ARG) {
  console.error('Usage: node scripts/build-batch.mjs <batch-file>');
  process.exit(1);
}
const batchPath = BATCH_ARG.startsWith('/') || BATCH_ARG.includes(':') ? BATCH_ARG : join(process.cwd(), BATCH_ARG);

const { default: rows, countryCode: explicitCC } = await import(pathToFileURL(batchPath).href);

const round1 = (v) => Math.round(v * 10) / 10;

function expand(row) {
  const [
    slug, name, description, categories, dietType,
    ingredients, steps, macros, extras,
  ] = row;
  const ex = extras || {};
  const [protein, carbs, fat, fiber = null, sugar = null, sodium = null, satFatRaw = null] =
    Array.isArray(macros) ? macros : (() => { throw new Error(`Row "${slug}" has invalid/missing macro array`); })();
  const satFat = satFatRaw == null ? round1(fat / 3) : satFatRaw;
  const calories = Math.round(protein * 4 + carbs * 4 + fat * 9);
  return {
    slug,
    name,
    description,
    categories,
    proteinType: categories.includes('beef') ? 'BEEF'
      : categories.includes('chicken') ? 'CHICKEN'
      : categories.includes('seafood') ? 'SEAFOOD'
      : ['NONE', 'VEGETARIAN'].includes((dietType || '').toUpperCase()) && categories.includes('desserts') ? 'NONE'
      : 'VEGETARIAN',
    dietType: dietType ? String(dietType).toUpperCase() : null,
    difficulty: ex.difficulty || 'MEDIUM',
    prepTimeMin: ex.prepTimeMin ?? 15,
    cookTimeMin: ex.cookTimeMin ?? 30,
    servings: ex.servings ?? 4,
    servingSize: ex.servingSize ?? '1 plate (320g)',
    homePrepCost: ex.homePrepCost ?? null,
    restaurantPrice: ex.restaurantPrice ?? null,
    currency: ex.currency ?? null,
    imageUrl: null,
    isPopular: !!ex.isPopular,
    isTrending: !!ex.isTrending,
    isFeatured: !!ex.isFeatured,
    popularityScore: ex.popularityScore ?? 62,
    published: true,
    tags: ex.tags ?? [],
    ingredients: ingredients.map(([n, q, u, note]) => ({
      name: n,
      quantity: q ?? null,
      unit: u,
      note: note || null,
    })),
    steps: steps.map((instruction, i) => ({ position: i + 1, instruction })),
    nutrition: {
      calories,
      protein,
      carbohydrates: carbs,
      fat,
      fiber,
      sugar,
      sodium,
      saturatedFat: satFat,
    },
    videos: [],
  };
}

// Load existing country files (slug -> file mapping)
const bySlugExisting = new Map();
for (const f of readdirSync(RECIPES_DIR).filter((x) => x.endsWith('.json'))) {
  const j = JSON.parse(readFileSync(join(RECIPES_DIR, f), 'utf8'));
  for (const r of j.recipes || [j]) bySlugExisting.set(r.slug, { file: f, obj: j });
}

let added = 0;
let skipped = 0;
const grouped = new Map(); // countryCode -> rows[]

for (const row of rows) {
  if (!Array.isArray(row) || typeof row[0] !== 'string') {
    if (row != null) console.log(`Skipping malformed entry: ${JSON.stringify(row).slice(0, 80)}`);
    continue;
  }
  if (bySlugExisting.has(row[0])) {
    skipped++;
    continue;
  }
  const cc = explicitCC || row[9] || null;
  if (!cc) throw new Error(`No countryCode resolvable for ${row[0]}`);
  if (!grouped.has(cc)) grouped.set(cc, []);
  grouped.get(cc).push(expand(row));
  added++;
}

for (const [cc, newRecipes] of grouped) {
  const targetFile = join(RECIPES_DIR, `${cc}.json`);
  let doc;
  if (readdirSync(RECIPES_DIR).includes(`${cc}.json`)) {
    doc = JSON.parse(readFileSync(targetFile, 'utf8'));
    if (!Array.isArray(doc.recipes)) throw new Error(`${targetFile} is not a batch-style country file.`);
  } else {
    doc = { countryCode: cc, recipes: [] };
  }
  doc.recipes.push(...newRecipes);
  writeFileSync(targetFile, JSON.stringify(doc, null, 2) + '\n');
  console.log(`${cc}: +${newRecipes.length} -> total ${doc.recipes.length}`);
}

try { unlinkSync(batchPath); } catch {}
console.log(`Added ${added}, skipped ${skipped} (already present). Batch file removed.`);
