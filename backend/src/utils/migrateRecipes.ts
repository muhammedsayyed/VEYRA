import mongoose from "mongoose";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();
import { Country } from "../models/Country.js";
import { Category } from "../models/Category.js";
import { Recipe } from "../models/Recipe.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Data is at project root prisma/seed-data
const DATA_DIR = join(__dirname, "..", "..", "..", "prisma", "seed-data");
const RECIPES_DIR = join(DATA_DIR, "recipes");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/veyra";

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

async function migrate() {
  console.log("[Migrate] Connecting to MongoDB...", MONGODB_URI.replace(/\/\/.*@/, "//***@"));
  await mongoose.connect(MONGODB_URI);
  console.log("[Migrate] Connected", mongoose.connection.host);

  // Load countries
  const countriesPath = join(DATA_DIR, "countries.json");
  const categoriesPath = join(DATA_DIR, "categories.json");
  if (!existsSync(countriesPath) || !existsSync(categoriesPath)) {
    console.error("[Migrate] Missing countries.json or categories.json at", DATA_DIR);
    process.exit(1);
  }
  const countries = readJson(countriesPath);
  const categories = readJson(categoriesPath);
  console.log(`[Migrate] Found ${countries.length} countries, ${categories.length} categories`);

  let countryCount = 0;
  const countryMap = new Map<string, any>();
  for (const c of countries) {
    const data = {
      code: c.code,
      slug: c.slug,
      name: c.name,
      region: c.region || null,
      cuisineLabel: c.cuisineLabel,
      currency: c.currency || null,
    };
    const doc = await Country.findOneAndUpdate({ code: c.code }, data, { upsert: true, new: true, setDefaultsOnInsert: true });
    countryMap.set(c.code, doc);
    countryCount++;
  }
  console.log(`[Migrate] Upserted ${countryCount} countries`);

  let catCount = 0;
  const categoryBySlug = new Map<string, any>();
  for (const cat of categories) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { slug: cat.slug, name: cat.name, description: cat.description || null, sortOrder: cat.sortOrder || 0 },
      { upsert: true, new: true }
    );
    categoryBySlug.set(cat.slug, doc);
    catCount++;
  }
  console.log(`[Migrate] Upserted ${catCount} categories`);

  // Load recipes
  const recipeFiles = readdirSync(RECIPES_DIR).filter((f) => f.endsWith(".json")).sort();
  let totalRecipes = 0;
  let totalVideos = 0;
  let upserted = 0;
  let skipped = 0;

  // Build country code -> name/currency map
  const countryMeta = new Map<string, { name: string; currency: string | null }>();
  for (const c of countries) countryMeta.set(c.code, { name: c.name, currency: c.currency });

  for (const file of recipeFiles) {
    const parsed = readJson(join(RECIPES_DIR, file));
    const countryCode = parsed.countryCode || file.replace(".json", "").split("-").pop() || "unknown";
    const recipes = Array.isArray(parsed.recipes) ? parsed.recipes : [parsed];
    const meta = countryMeta.get(countryCode) || { name: countryCode, currency: null };

    for (const r of recipes) {
      totalRecipes++;
      if (Array.isArray(r.videos)) totalVideos += r.videos.length;

      // Transform to Mongoose shape
      const slug = r.slug;
      if (!slug) { skipped++; continue; }

      const docData: any = {
        slug: r.slug,
        name: r.name,
        description: r.description || null,
        countryCode: (r.countryCode || countryCode || "").toLowerCase(),
        countryName: meta.name,
        difficulty: r.difficulty || "MEDIUM",
        proteinType: r.proteinType || null,
        dietType: r.dietType || null,
        prepTimeMin: r.prepTimeMin ?? null,
        cookTimeMin: r.cookTimeMin ?? null,
        servings: r.servings ?? 1,
        servingSize: r.servingSize || null,
        homePrepCost: r.homePrepCost ?? null,
        restaurantPrice: r.restaurantPrice ?? null,
        currency: r.currency || meta.currency || null,
        imageUrl: r.imageUrl || null,
        isPopular: Boolean(r.isPopular),
        isTrending: Boolean(r.isTrending),
        isFeatured: Boolean(r.isFeatured),
        popularityScore: Number.isFinite(r.popularityScore) ? Math.trunc(r.popularityScore) : 0,
        published: r.published !== false,
        tags: Array.isArray(r.tags) ? r.tags : [],
        categories: Array.isArray(r.categories) ? r.categories : [],
        // Ingredients: keep as array of objects
        ingredients: Array.isArray(r.ingredients)
          ? r.ingredients.map((ing: any) => ({
              name: ing.name,
              quantity: ing.quantity ?? null,
              unit: ing.unit ?? null,
              note: ing.note ?? null,
            }))
          : [],
        // Steps: store as array of strings (instructions)
        steps: Array.isArray(r.steps)
          ? r.steps.map((s: any) => (typeof s === "string" ? s : s.instruction)).filter(Boolean)
          : [],
        nutrition: r.nutrition
          ? {
              calories: r.nutrition.calories ?? 0,
              protein: r.nutrition.protein ?? 0,
              carbohydrates: r.nutrition.carbohydrates ?? 0,
              fat: r.nutrition.fat ?? 0,
              fiber: r.nutrition.fiber ?? null,
              sugar: r.nutrition.sugar ?? null,
              sodium: r.nutrition.sodium ?? null,
              saturatedFat: r.nutrition.saturatedFat ?? null,
            }
          : undefined,
        videos: Array.isArray(r.videos)
          ? r.videos.map((v: any) => ({
              youtubeVideoId: v.youtubeVideoId,
              youtubeUrl: v.youtubeUrl,
              videoTitle: v.videoTitle || null,
              channelName: v.channelName || null,
            }))
          : [],
      };

      // Clean up undefined nutrition to avoid empty object
      if (!docData.nutrition || docData.nutrition.calories === undefined) delete docData.nutrition;

      await Recipe.findOneAndUpdate({ slug }, docData, { upsert: true, new: true, setDefaultsOnInsert: true });
      upserted++;
    }
  }

  console.log(`[Migrate] Processed ${totalRecipes} recipes from ${recipeFiles.length} files`);
  console.log(`[Migrate] Upserted ${upserted} recipes, skipped ${skipped}, videos total ${totalVideos}`);

  // Verify counts
  const dbCountries = await Country.countDocuments();
  const dbRecipes = await Recipe.countDocuments();
  const dbCategories = await Category.countDocuments();
  const videoAgg = await Recipe.aggregate([
    { $project: { videoCount: { $size: { $ifNull: ["$videos", []] } } } },
    { $group: { _id: null, total: { $sum: "$videoCount" } } },
  ]);
  const dbVideos = videoAgg[0]?.total || 0;

  console.log(`[Migrate] Final MongoDB counts:`);
  console.log(`  Countries: ${dbCountries} (expected 20)`);
  console.log(`  Categories: ${dbCategories}`);
  console.log(`  Recipes: ${dbRecipes} (expected ~1400)`);
  console.log(`  Videos: ${dbVideos} (expected 274)`);

  if (dbCountries !== 20) console.warn(`[Migrate] WARNING: countries count mismatch!`);
  if (dbRecipes < 1390 || dbRecipes > 1410) console.warn(`[Migrate] WARNING: recipes count not ~1400!`);
  if (dbVideos !== 274) console.warn(`[Migrate] WARNING: videos count not 274 (got ${dbVideos}) - check source`);

  await mongoose.disconnect();
  console.log("[Migrate] Done, disconnected");
}

migrate().catch((e) => {
  console.error("[Migrate] Failed", e);
  process.exit(1);
});
