/**
 * VEYRA Food System seed pipeline (Phase 2).
 *
 * Designed for the full production dataset (~20 countries x 70 recipes
 * = ~1,400 recipes) using efficient bulk operations:
 *
 *   - countries / categories : small upsert loops
 *   - ingredients            : one bulk createMany + single id-map fetch
 *   - recipes                : bulk createMany for new rows; targeted updates
 *                              only when source content actually changed
 *   - per-recipe relations   : chunked bulk delete + bulk create
 *                              (ingredients, steps, nutrition, videos,
 *                               category joins)
 *
 * Idempotent & deterministic: safe to re-run at any time; re-runs produce
 * identical database state and never duplicate rows. Recipes are keyed by
 * their stable unique slug (existing favorites/reviews referencing those
 * slugs/ids remain valid).
 *
 * Data layout (source of truth): prisma/seed-data/
 *   countries.json                  - manifest of all countries
 *   categories.json                 - category catalog
 *   recipes/<country-slug>.json     - { "countryCode": "...", "recipes": [...] }
 *
 * IMPORTANT: A recipe's "videos" array may ONLY contain verified cooking
 * tutorials for that exact dish. Empty array = no video yet. Never fabricate
 * YouTube entries.
 *
 * Usage: npm run seed:food   (or: node scripts/seed-food.mjs)
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'prisma', 'seed-data');
const RECIPES_DIR = join(DATA_DIR, 'recipes');
const CHUNK_SIZE = 100;

// ---------------------------------------------------------------------------
// Minimal .env loader (no dependency on dotenv).
// ---------------------------------------------------------------------------

function loadEnvFile() {
  try {
    const raw = readFileSync(join(__dirname, '..', '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      const value = match[2].replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env is optional when variables come from the environment.
  }
}
loadEnvFile();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

/** Normalizes a raw recipe JSON record into the base-column shape. */
function toBaseColumns(r, countryId, defaultCurrency) {
  return {
    slug: r.slug,
    name: r.name,
    description: r.description ?? null,
    countryId,
    difficulty: r.difficulty ?? 'MEDIUM',
    proteinType: r.proteinType ?? null,
    dietType: r.dietType ?? null,
    prepTimeMin: r.prepTimeMin ?? null,
    cookTimeMin: r.cookTimeMin ?? null,
    servings: r.servings ?? 1,
    servingSize: r.servingSize ?? null,
    homePrepCost: r.homePrepCost ?? null,
    restaurantPrice: r.restaurantPrice ?? null,
    currency: r.currency ?? defaultCurrency ?? null,
    imageUrl: r.imageUrl ?? null,
    isPopular: Boolean(r.isPopular),
    isTrending: Boolean(r.isTrending),
    isFeatured: Boolean(r.isFeatured),
    popularityScore: Number.isFinite(r.popularityScore) ? Math.trunc(r.popularityScore) : 0,
    published: r.published !== false,
    tags: Array.isArray(r.tags) ? r.tags : [],
  };
}

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------

function loadDataset() {
  const countries = JSON.parse(readFileSync(join(DATA_DIR, 'countries.json'), 'utf8'));
  const categories = JSON.parse(readFileSync(join(DATA_DIR, 'categories.json'), 'utf8'));

  const recipeFiles = readdirSync(RECIPES_DIR).filter((f) => f.endsWith('.json')).sort();
  const recipes = [];
  for (const f of recipeFiles) {
    const parsed = JSON.parse(readFileSync(join(RECIPES_DIR, f), 'utf8'));
    if (Array.isArray(parsed.recipes)) {
      for (const r of parsed.recipes) recipes.push({ ...r, __countryCodeOverride: parsed.countryCode });
    } else {
      // Legacy single-recipe file (Phase 1 layout) still supported.
      recipes.push(parsed);
    }
  }

  recipes.sort((a, b) => a.slug.localeCompare(b.slug));
  return { countries, categories, recipes };
}

// ---------------------------------------------------------------------------
// Seed phases
// ---------------------------------------------------------------------------

async function seedCountries(prisma, countries) {
  const map = new Map();
  for (const c of countries) {
    const data = {
      code: c.code,
      slug: c.slug ?? slugify(c.name),
      name: c.name,
      region: c.region ?? null,
      cuisineLabel: c.cuisineLabel ?? `${c.name}n`,
      currency: c.currency ?? null,
    };
    const row = await prisma.country.upsert({
      where: { code: c.code },
      create: data,
      update: data,
    });
    map.set(c.code, row);
  }
  return map;
}

async function seedCategories(prisma, categories) {
  const map = new Map();
  for (const cat of categories) {
    const data = {
      slug: cat.slug,
      name: cat.name,
      description: cat.description ?? null,
      sortOrder: cat.sortOrder ?? 0,
    };
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: data,
      update: data,
    });
    map.set(cat.slug, row);
  }
  return map;
}

async function ensureIngredients(prisma, recipes) {
  // Canonicalize ingredients case-insensitively (e.g. "Frying Oil" and
  // "Frying oil" are the same ingredient). The first-seen spelling wins.
  const canonical = new Map(); // slugKey -> display name
  for (const r of recipes) {
    for (const line of r.ingredients || []) {
      const key = slugify(line.name);
      if (!key) continue;
      if (!canonical.has(key)) canonical.set(key, line.name);
    }
  }
  const names = [...canonical.values()].sort();

  await prisma.ingredient.createMany({
    data: names.map((name) => ({ name, slug: slugify(name) })),
    skipDuplicates: true,
  });

  const map = new Map(); // slugKey -> ingredient id
  const allKeys = [...canonical.keys()];
  for (const group of chunk(allKeys, 500)) {
    const rows = await prisma.ingredient.findMany({
      where: { slug: { in: group } },
      select: { id: true, slug: true },
    });
    for (const row of rows) map.set(row.slug, row.id);
  }
  return map;
}

async function seedRecipes(prisma, recipes, countryMap, categoryMap, ingredientMap) {
  const prepared = recipes.map((r) => {
    const countryCode = r.__countryCodeOverride || r.countryCode || r.country?.code;
    const country = countryMap.get(countryCode);
    if (!country) throw new Error(`Recipe "${r.slug}" references unknown country "${countryCode}".`);
    return { raw: r, base: toBaseColumns(r, country.id, country.currency), countryCode };
  });

  const existing = await prisma.recipe.findMany({
    select: { id: true, slug: true, name: true },
  });
  const existingBySlug = new Map(existing.map((e) => [e.slug, e]));

  // 1) Bulk-create brand new recipe rows (no relations yet).
  const newRows = prepared.filter((p) => !existingBySlug.has(p.base.slug));
  for (const group of chunk(newRows, CHUNK_SIZE)) {
    await prisma.recipe.createMany({
      data: group.map((p) => p.base),
      skipDuplicates: true,
    });
  }

  // 2) Refresh slug -> id map and apply targeted updates for changed bases.
  const allRows = await prisma.recipe.findMany({ select: { id: true, slug: true } });
  const idBySlug = new Map(allRows.map((r) => [r.slug, r.id]));

  let updatedCount = 0;
  for (const p of prepared) {
    const id = idBySlug.get(p.base.slug);
    if (!id) continue;
    const current = await prisma.recipe.findUnique({
      where: { id },
      select: {
        name: true, description: true, difficulty: true, proteinType: true,
        dietType: true, prepTimeMin: true, cookTimeMin: true, servings: true,
        servingSize: true, homePrepCost: true, restaurantPrice: true,
        currency: true, imageUrl: true, isPopular: true, isTrending: true,
        isFeatured: true, popularityScore: true, published: true, tags: true,
        countryId: true,
      },
    });
    if (!current) continue;
    if (stableStringify(current) !== stableStringify(p.base)) {
      await prisma.recipe.update({ where: { id }, data: p.base });
      updatedCount++;
    }
  }

  // 3) Replace relations in chunks (bulk delete + bulk create).
  let relationOps = 0;
  for (const group of chunk(prepared, CHUNK_SIZE)) {
    const ids = group.map((p) => idBySlug.get(p.base.slug)).filter(Boolean);

    const ingredientRows = [];
    const stepRows = [];
    const videoRows = [];
    const nutritionRows = [];
    const categoryRows = [];

    for (const p of group) {
      const recipeId = idBySlug.get(p.base.slug);
      if (!recipeId) continue;

      let position = 1;
      for (const line of p.raw.ingredients || []) {
        const ingredientId = ingredientMap.get(slugify(line.name));
        if (!ingredientId) throw new Error(`Missing ingredient "${line.name}" for ${p.base.slug}`);
        ingredientRows.push({
          recipeId,
          ingredientId,
          quantity: line.quantity ?? null,
          unit: line.unit ?? null,
          note: line.note ?? null,
          position: position++,
        });
      }

      let stepPos = 1;
      for (const s of p.raw.steps || []) {
        stepRows.push({
          recipeId,
          position: Number.isFinite(s.position) ? s.position : stepPos++,
          instruction: s.instruction,
        });
      }

      for (const v of p.raw.videos || []) {
        videoRows.push({
          recipeId,
          youtubeVideoId: v.youtubeVideoId,
          youtubeUrl: v.youtubeUrl,
          videoTitle: v.videoTitle ?? null,
          channelName: v.channelName ?? null,
          isPrimary: v.isPrimary !== false,
        });
      }

      if (p.raw.nutrition) {
        nutritionRows.push({
          recipeId,
          calories: p.raw.nutrition.calories,
          protein: p.raw.nutrition.protein,
          carbohydrates: p.raw.nutrition.carbohydrates,
          fat: p.raw.nutrition.fat,
          fiber: p.raw.nutrition.fiber ?? null,
          sugar: p.raw.nutrition.sugar ?? null,
          sodium: p.raw.nutrition.sodium ?? null,
          saturatedFat: p.raw.nutrition.saturatedFat ?? null,
        });
      }

      for (const slug of p.raw.categories || []) {
        const cat = categoryMap.get(slug);
        if (!cat) throw new Error(`Unknown category "${slug}" on ${p.base.slug}`);
        categoryRows.push({ recipeId, categoryId: cat.id });
      }
    }

    if (ids.length === 0) continue;

    await prisma.$transaction([
      prisma.recipeIngredient.deleteMany({ where: { recipeId: { in: ids } } }),
      prisma.recipeStep.deleteMany({ where: { recipeId: { in: ids } } }),
      prisma.recipeVideo.deleteMany({ where: { recipeId: { in: ids } } }),
      prisma.recipeNutrition.deleteMany({ where: { recipeId: { in: ids } } }),
      prisma.recipeCategory.deleteMany({ where: { recipeId: { in: ids } } }),
    ]);

    // Deduplicate category rows (same recipeId + categoryId)
    const seenCats = new Set();
    const dedupedCategoryRows = categoryRows.filter(r => {
      const key = `${r.recipeId}:${r.categoryId}`;
      if (seenCats.has(key)) return false;
      seenCats.add(key);
      return true;
    });

    if (ingredientRows.length) await prisma.recipeIngredient.createMany({ data: ingredientRows });
    if (stepRows.length) await prisma.recipeStep.createMany({ data: stepRows });
    if (videoRows.length) await prisma.recipeVideo.createMany({ data: videoRows });
    if (nutritionRows.length) await prisma.recipeNutrition.createMany({ data: nutritionRows });
    if (dedupedCategoryRows.length) await prisma.recipeCategory.createMany({ data: dedupedCategoryRows });
    relationOps += 5;
  }

  return { total: prepared.length, created: newRows.length, updated: updatedCount, relationOps };
}

// ---------------------------------------------------------------------------

async function main() {
  const startedAt = Date.now();
  const prisma = new PrismaClient();
  try {
    const { countries, categories, recipes } = loadDataset();
    console.log(
      `Seeding ${countries.length} countries | ${categories.length} categories | ${recipes.length} recipes...`
    );

    const countryMap = await seedCountries(prisma, countries);
    const categoryMap = await seedCategories(prisma, categories);
    const ingredientMap = await ensureIngredients(prisma, recipes);
    const result = await seedRecipes(prisma, recipes, countryMap, categoryMap, ingredientMap);

    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(
      `Seed complete in ${seconds}s -> created: ${result.created}, updated: ${result.updated}, ` +
      `relation batches: ${result.relationOps}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
