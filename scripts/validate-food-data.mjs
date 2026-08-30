/**
 * VEYRA Food Dataset Validator (Phase 2 gatekeeper).
 *
 * Validates the entire prisma/seed-data dataset against the production
 * contract:
 *   - 20 countries, each with EXACTLY: 20 Beef / 20 Chicken / 20 Vegetarian
 *     / 10 Dessert recipes (= 70 per country, 1,400 total).
 *   - Full structural integrity: unique ids/slugs, valid references,
 *     enums, ingredients with exact quantities/units, ordered steps,
 *     plausible nutrition, servings, pricing/currency, YouTube format.
 *
 * Exit codes: 0 = PASS, 1 = FAIL or INCOMPLETE.
 * Usage: node scripts/validate-food-data.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'prisma', 'seed-data');
const RECIPES_DIR = join(DATA_DIR, 'recipes');

const TARGET = { BEEF: 20, CHICKEN: 20, VEGETARIAN: 20, DESSERTS: 10 };
const REQUIRED_COUNTRIES = ['eg','sa','ae','tr','it','fr','es','de','gb','gr','us','mx','br','in','cn','jp','kr','th','ma','ng'];

const PROTEIN_TYPES = ['BEEF','CHICKEN','SEAFOOD','PORK','LAMB','MIXED','VEGETARIAN','NONE'];
const DIET_TYPES = ['BALANCED','HIGH_PROTEIN','LOW_CARB','KETO','VEGETARIAN','VEGAN','GLUTEN_FREE','HALAL'];
const DIFFICULTIES = ['EASY','MEDIUM','HARD'];
const UNITS = new Set(['g','kg','ml','l','pcs','pieces','cloves','clove','tbsp','tsp','cup','cups','slices','sheets','cans','pinch','sprigs','sticks','sets','set','packs','skewers','large pcs']);

const errors = [];
let warnings = 0;

function err(file, msg) {
  errors.push(`${file ? file + ': ' : ''}${msg}`);
}
function warn(msg) {
  warnings++;
  console.log(`  WARN ${msg}`);
}

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

// ---------------------------------------------------------------------------
// Load data
// ---------------------------------------------------------------------------

const countries = loadJson(join(DATA_DIR, 'countries.json'));
const categories = loadJson(join(DATA_DIR, 'categories.json'));
const categorySlugs = new Set(categories.map((c) => c.slug));

const recipes = [];
for (const f of readdirSync(RECIPES_DIR).filter((x) => x.endsWith('.json')).sort()) {
  const parsed = loadJson(join(RECIPES_DIR, f));
  if (Array.isArray(parsed.recipes)) {
    for (const r of parsed.recipes) recipes.push({ ...r, __file: f, __countryCode: parsed.countryCode });
  } else {
    recipes.push({ ...parsed, __file: f, __countryCode: parsed.countryCode });
  }
}

console.log('='.repeat(64));
console.log('VEYRA FOOD DATASET VALIDATION');
console.log('='.repeat(64));

// ---------------------------------------------------------------------------
// Countries manifest
// ---------------------------------------------------------------------------

const countryCodes = new Set(countries.map((c) => c.code));
if (countries.length !== 20) err('', `Expected 20 countries in manifest, found ${countries.length}.`);
for (const code of REQUIRED_COUNTRIES) {
  if (!countryCodes.has(code)) err('', `Required country missing from manifest: "${code}".`);
}
{
  const codes = new Set(), slugs = new Set(), names = new Set();
  for (const c of countries) {
    if (codes.has(c.code)) err('countries.json', `Duplicate country code "${c.code}".`);
    if (slugs.has(c.slug)) err('countries.json', `Duplicate country slug "${c.slug}".`);
    if (names.has(c.name)) err('countries.json', `Duplicate country name "${c.name}".`);
    codes.add(c.code); slugs.add(c.slug); names.add(c.name);
    for (const k of ['code','slug','name','region','cuisineLabel']) {
      if (!c[k] || typeof c[k] !== 'string') err('countries.json', `Country "${c.code}" missing/invalid field "${k}".`);
    }
    if (!/^[a-z]{2}$/.test(c.code)) warn(`Country "${c.name}" code should be a 2-letter lowercase code.`);
  }
}

const countryByCode = new Map(countries.map((c) => [c.code, c]));

// ---------------------------------------------------------------------------
// Recipes - structural validation
// ---------------------------------------------------------------------------

const slugs = new Set();
const nameCountry = new Map();
const byCountryCategory = new Map(); // code -> { BEEF:n, CHICKEN:n, VEGETARIAN:n, DESSERTS:n }

function classify(r) {
  const cats = r.categories || [];
  if (cats.includes('desserts')) return 'DESSERTS';
  if (r.proteinType === 'BEEF' || cats.includes('beef')) return 'BEEF';
  if (r.proteinType === 'CHICKEN' || cats.includes('chicken')) return 'CHICKEN';
  return 'VEGETARIAN';
}

let videoCount = 0;
const seenVideoIds = new Map(); // videoId -> slug
const seenVideoUrls = new Map(); // url -> slug

recipes.forEach((r, idx) => {
  const F = r.__file;
  const label = r.slug || `(recipe #${idx})`;

  // Identity & references
  if (!r.slug || !/^[a-z0-9-]{2,80}$/.test(r.slug)) err(F, `${label}: slug missing or invalid.`);
  if (slugs.has(r.slug)) err(F, `Duplicate recipe slug "${r.slug}".`);
  slugs.add(r.slug);

  if (!countryByCode.has(r.__countryCode)) {
    err(F, `${label}: unknown countryCode "${r.__countryCode}".`);
  }

  const normName = (r.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const key = `${r.__countryCode}|${normName}`;
  if (nameCountry.has(key)) err(F, `${label}: possible duplicate of "${nameCountry.get(key)}" in same country.`);
  nameCountry.set(key, label);

  // Required text fields
  for (const k of ['name', 'description']) {
    if (!r[k] || String(r[k]).trim().length < 5) err(F, `${label}: missing/empty required field "${k}".`);
  }

  // Enums
  if (!PROTEIN_TYPES.includes(r.proteinType)) err(F, `${label}: invalid proteinType "${r.proteinType}".`);
  if (r.dietType && !DIET_TYPES.includes(r.dietType)) err(F, `${label}: invalid dietType "${r.dietType}"`);
  if (!DIFFICULTIES.includes(r.difficulty)) err(F, `${label}: invalid difficulty "${r.difficulty}".`);

  // Categories
  if (!Array.isArray(r.categories) || r.categories.length === 0) {
    err(F, `${label}: must belong to at least one category.`);
  } else {
    for (const cslug of r.categories) {
      if (!categorySlugs.has(cslug)) err(F, `${label}: unknown category "${cslug}".`);
    }
    // Consistency between categories and protein type
    if (r.categories.includes('beef') && r.proteinType !== 'BEEF')
      err(F, `${label}: has "beef" category but proteinType is "${r.proteinType}". Beef recipes must actually contain beef.`);
    if (r.categories.includes('chicken') && r.proteinType !== 'CHICKEN')
      err(F, `${label}: has "chicken" category but proteinType is "${r.proteinType}". Chicken recipes must actually contain chicken.`);
    if (r.categories.includes('vegetarian') && !['VEGETARIAN', 'NONE'].includes(r.proteinType))
      err(F, `${label}: "vegetarian" category requires proteinType VEGETARIAN/NONE (got ${r.proteinType}).`);
    if (r.categories.includes('desserts') && !['NONE', 'VEGETARIAN'].includes(r.proteinType))
      err(F, `${label}: desserts must not carry meat protein types (got ${r.proteinType}).`);
    if (r.categories.includes('seafood') && r.proteinType !== 'SEAFOOD')
      err(F, `${label}: has "seafood" category but proteinType is "${r.proteinType}".`);
  }

  // Times / servings / serving size
  for (const k of ['prepTimeMin', 'cookTimeMin']) {
    const v = r[k];
    if (v !== undefined && v !== null && (!Number.isFinite(v) || v < 0 || v > 1440)) err(F, `${label}: ${k} out of range.`);
  }
  if (!Number.isInteger(r.servings) || r.servings < 1 || r.servings > 24)
    err(F, `${label}: servings must be an integer 1-24 (got ${JSON.stringify(r.servings)}).`);
  if (r.servingSize && String(r.servingSize).length < 3) err(F, `${label}: servingSize too short.`);

  // Ingredients
  if (!Array.isArray(r.ingredients) || r.ingredients.length < 3) {
    err(F, `${label}: at least 3 structured ingredients are required.`);
  } else {
    r.ingredients.forEach((ing, i) => {
      const pos = i + 1;
      if (!ing.name || typeof ing.name !== 'string') err(F, `${label}: ingredient ${pos} missing name.`);
      const q = ing.quantity;
      if (q !== undefined && q !== null && (!Number.isFinite(q) || q <= 0 || q > 20000))
        err(F, `${label}: ingredient "${ing.name}" has invalid quantity ${q}.`);
      if (q === undefined || q === null) warn(`${label}: ingredient "${ing.name}" has no quantity.`);
      const unit = (ing.unit || '').toLowerCase().trim();
      if (!unit) err(F, `${label}: ingredient "${ing.name}" missing unit.`);
      else if (!UNITS.has(unit)) err(F, `${label}: ingredient "${ing.name}" uses non-standard unit "${unit}".`);
    });
  }

  // Steps
  if (!Array.isArray(r.steps) || r.steps.length < 2) {
    err(F, `${label}: at least 2 preparation steps are required.`);
  } else {
    r.steps.forEach((s, i) => {
      if (!Number.isFinite(s.position)) err(F, `${label}: step ${i + 1} missing position.`);
      if (!s.instruction || String(s.instruction).trim().length < 10) err(F, `${label}: step ${i + 1} instruction too short/missing.`);
    });
    const positions = r.steps.map((s) => s.position);
    if (new Set(positions).size !== positions.length) err(F, `${label}: duplicate step positions.`);
  }

  // Nutrition sanity rules
  const n = r.nutrition;
  if (!n || typeof n !== 'object') {
    err(F, `${label}: nutrition object is required.`);
  } else {
    for (const k of ['calories', 'protein', 'carbohydrates', 'fat']) {
      if (typeof n[k] !== 'number' || Number.isNaN(n[k])) err(F, `${label}: nutrition.${k} must be a number.`);
      else if (n[k] < 0) err(F, `${label}: nutrition.${k} is negative - invalid.`);
    }
    for (const k of ['fiber', 'sugar', 'sodium', 'saturatedFat']) {
      if (n[k] !== undefined && n[k] !== null && n[k] < 0) err(F, `${label}: nutrition.${k} is negative - invalid.`);
    }
    if (typeof n.calories === 'number' && (n.calories < 20 || n.calories > 2000))
      err(F, `${label}: calories ${n.calories} outside plausible range 20-2000.`);
    if (
      typeof n.calories === 'number' &&
      [n.protein, n.carbohydrates, n.fat].every((v) => typeof v === 'number')
    ) {
      const computed = n.protein * 4 + n.carbohydrates * 4 + n.fat * 9;
      const diff = Math.abs(computed - n.calories);
      if (diff / Math.max(n.calories, 1) > 0.45 && diff > 160)
        err(F, `${label}: implausible macro/calorie combination (stated ${n.calories} kcal vs computed ~${Math.round(computed)} kcal).`);
    }
    if (typeof n.sugar === 'number' && typeof n.carbohydrates === 'number' && n.sugar > n.carbohydrates)
      err(F, `${label}: sugar exceeds total carbohydrates - invalid.`);
    if (typeof n.saturatedFat === 'number' && typeof n.fat === 'number' && n.saturatedFat > n.fat)
      err(F, `${label}: saturatedFat exceeds total fat - invalid.`);
    if (typeof n.sodium === 'number' && n.sodium > 6000)
      err(F, `${label}: sodium ${n.sodium}mg implausibly high (>6g).`);
    for (const k of ['fiber', 'sodium']) {
      if (n[k] === undefined || n[k] === null) warn(`${label}: nutrition.${k} not provided (recommended).`);
    }
  }

  // Pricing
  const country = countryByCode.get(r.__countryCode);
  const currency = r.currency || (country && country.currency);
  if ((r.homePrepCost != null || r.restaurantPrice != null) && !(currency || '').match(/^[A-Z]{3}$/)) {
    err(F, `${label}: pricing present without valid ISO currency code ("${currency}").`);
  }
  if (r.homePrepCost != null && (!Number.isFinite(r.homePrepCost) || r.homePrepCost < 0))
    err(F, `${label}: homePrepCost invalid.`);
  if (r.restaurantPrice != null && (!Number.isFinite(r.restaurantPrice) || r.restaurantPrice < 0))
    err(F, `${label}: restaurantPrice invalid.`);

  // Popularity metadata
  for (const k of ['isPopular', 'isTrending', 'isFeatured']) {
    if (typeof r[k] !== 'boolean') err(F, `${label}: ${k} must be a boolean.`);
  }
  if (!Number.isFinite(r.popularityScore) || r.popularityScore < 0 || r.popularityScore > 100)
    err(F, `${label}: popularityScore must be 0-100.`);

  // Images: nullable; when present must be https URL
  if (r.imageUrl && !/^https:\/\/.+/.test(r.imageUrl)) err(F, `${label}: imageUrl must be an https URL or null.`);

  // YouTube policy: only verified entries allowed, strict ID format + duplicate prevention
  if (Array.isArray(r.videos)) {
    if (r.videos.length > 1) err(F, `${label}: duplicate RecipeVideo records for same recipe (found ${r.videos.length}, expected 0 or 1).`);
    for (const v of r.videos) {
      videoCount++;
      if (!/^[a-zA-Z0-9_-]{11}$/.test(v.youtubeVideoId || '')) err(F, `${label}: youtubeVideoId must be exactly 11 chars.`);
      if (v.youtubeVideoId === 'dQw4w9WgXcQ') err(F, `${label}: rejected dummy video ID.`);
      if (!/^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/.test(v.youtubeUrl || ''))
        err(F, `${label}: youtubeUrl format invalid.`);
      if (v.youtubeVideoId && v.youtubeUrl && !v.youtubeUrl.includes(v.youtubeVideoId))
        err(F, `${label}: youtubeUrl does not contain youtubeVideoId.`);
      if (!v.videoTitle || String(v.videoTitle).trim().length < 5) err(F, `${label}: videoTitle missing or too short.`);
      if (!v.channelName || String(v.channelName).trim().length < 2) err(F, `${label}: channelName missing or too short.`);
      // Global duplicate checks
      if (v.youtubeVideoId) {
        if (seenVideoIds.has(v.youtubeVideoId)) {
          err(F, `${label}: duplicate youtubeVideoId "${v.youtubeVideoId}" already used for "${seenVideoIds.get(v.youtubeVideoId)}".`);
        } else seenVideoIds.set(v.youtubeVideoId, label);
      }
      if (v.youtubeUrl) {
        if (seenVideoUrls.has(v.youtubeUrl)) {
          err(F, `${label}: duplicate youtubeUrl "${v.youtubeUrl}" already used for "${seenVideoUrls.get(v.youtubeUrl)}".`);
        } else seenVideoUrls.set(v.youtubeUrl, label);
      }
    }
  } else {
    err(F, `${label}: videos array missing (use empty array when no verified video exists).`);
  }

  // Tags
  if (!Array.isArray(r.tags)) err(F, `${label}: tags array missing (may be empty).`);

  // Bucket tally
  const cc = r.__countryCode;
  if (!byCountryCategory.has(cc)) byCountryCategory.set(cc, { BEEF: 0, CHICKEN: 0, VEGETARIAN: 0, DESSERTS: 0 });
  byCountryCategory.get(cc)[classify(r)]++;
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log('');
console.log(`COUNTRIES: ${countries.length}/20`);
console.log(`RECIPES:   ${recipes.length}/1400`);
console.log('');

let allCountsExact = true;
for (const c of countries.sort((a, b) => a.name.localeCompare(b.name))) {
  const t = byCountryCategory.get(c.code) || { BEEF: 0, CHICKEN: 0, VEGETARIAN: 0, DESSERTS: 0 };
  const line =
    `${c.name.padEnd(22)} ` +
    `Beef:${String(t.BEEF).padStart(2)}/${TARGET.BEEF}  ` +
    `Chicken:${String(t.CHICKEN).padStart(2)}/${TARGET.CHICKEN}  ` +
    `Veg:${String(t.VEGETARIAN).padStart(2)}/${TARGET.VEGETARIAN}  ` +
    `Desserts:${String(t.DESSERTS).padStart(2)}/${TARGET.DESSERTS}`;
  console.log(line);
  if (t.BEEF !== TARGET.BEEF || t.CHICKEN !== TARGET.CHICKEN || t.VEGETARIAN !== TARGET.VEGETARIAN || t.DESSERTS !== TARGET.DESSERTS)
    allCountsExact = false;
}

console.log('');
console.log(`Videos attached (verified only): ${videoCount}`);
console.log(`Recipes without videos:          ${recipes.length - videoCount}`);
console.log(`Warnings: ${warnings}`);

if (errors.length > 0) {
  console.log('');
  console.log(`ERRORS (${errors.length}):`);
  for (const e of errors.slice(0, 60)) console.log(`  x ${e}`);
  if (errors.length > 60) console.log(`  ... and ${errors.length - 60} more`);
}

console.log('');
const structuralOk = errors.length === 0;
const completeOk = structuralOk && countries.length === 20 && recipes.length === 1400 && allCountsExact;

if (completeOk) {
  console.log('VALIDATION: PASS');
} else if (structuralOk) {
  console.log(`VALIDATION: INCOMPLETE - structure valid, but dataset coverage is ${recipes.length}/1400.`);
  process.exitCode = 1;
} else {
  console.log('VALIDATION: FAIL - structural errors found.');
  process.exitCode = 1;
}
