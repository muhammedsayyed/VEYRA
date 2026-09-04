import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { Country } from "../models/Country.js";
import { Category } from "../models/Category.js";
import { Recipe } from "../models/Recipe.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/veyra";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("[Seed] Connected");

  // Countries
  const countriesData = [
    { code: "eg", slug: "egypt", name: "Egypt", region: "Middle East & North Africa", cuisineLabel: "Egyptian", currency: "EGP" },
    { code: "it", slug: "italy", name: "Italy", region: "Europe", cuisineLabel: "Italian", currency: "EUR" },
    { code: "jp", slug: "japan", name: "Japan", region: "Asia", cuisineLabel: "Japanese", currency: "JPY" },
    { code: "mx", slug: "mexico", name: "Mexico", region: "Latin America", cuisineLabel: "Mexican", currency: "MXN" },
    { code: "in", slug: "india", name: "India", region: "Asia", cuisineLabel: "Indian", currency: "INR" },
    { code: "us", slug: "usa", name: "USA", region: "North America", cuisineLabel: "American", currency: "USD" },
    { code: "fr", slug: "france", name: "France", region: "Europe", cuisineLabel: "French", currency: "EUR" },
    { code: "tr", slug: "turkey", name: "Turkey", region: "Middle East", cuisineLabel: "Turkish", currency: "TRY" },
  ];
  for (const c of countriesData) {
    await Country.updateOne({ code: c.code }, c, { upsert: true });
  }
  console.log("[Seed] Countries done");

  // Categories
  const cats = [
    { slug: "beef", name: "Beef", description: "Beef-based dishes", sortOrder: 1 },
    { slug: "chicken", name: "Chicken", sortOrder: 2 },
    { slug: "seafood", name: "Seafood", sortOrder: 3 },
    { slug: "vegetarian", name: "Vegetarian", sortOrder: 4 },
    { slug: "vegan", name: "Vegan", sortOrder: 5 },
    { slug: "breakfast", name: "Breakfast", sortOrder: 6 },
    { slug: "dessert", name: "Dessert", sortOrder: 7 },
    { slug: "healthy", name: "Healthy", sortOrder: 8 },
    { slug: "high-protein", name: "High Protein", sortOrder: 9 },
  ];
  for (const cat of cats) {
    await Category.updateOne({ slug: cat.slug }, cat, { upsert: true });
  }
  console.log("[Seed] Categories done");

  // Sample recipes (subset)
  const sampleRecipes = [
    {
      slug: "koshari-egyptian",
      name: "Koshari",
      description: "Egypt's beloved national dish — lentils, rice, pasta and crispy onions.",
      countryCode: "eg", countryName: "Egypt", difficulty: "MEDIUM", proteinType: "VEGETARIAN", dietType: "VEGETARIAN",
      prepTimeMin: 20, cookTimeMin: 40, servings: 4, currency: "EGP", homePrepCost: 45, restaurantPrice: 90,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
      isPopular: true, isFeatured: true, popularityScore: 95, tags: ["comfort", "street-food"], categories: ["vegetarian", "healthy"],
      ingredients: [{ name: "Rice", quantity: 200, unit: "g" }, { name: "Brown Lentils", quantity: 150, unit: "g" }, { name: "Chickpeas", quantity: 100, unit: "g" }],
      steps: ["Cook lentils and rice separately", "Fry onions until crispy", "Prepare tomato sauce with garlic", "Combine and serve hot"],
      nutrition: { calories: 420, protein: 18, carbohydrates: 68, fat: 9, fiber: 11, sodium: 320 },
      videos: [{ youtubeVideoId: "W1T4G3H7aBc", youtubeUrl: "https://www.youtube.com/watch?v=W1T4G3H7aBc", videoTitle: "How to make Koshari", channelName: "Egyptian Kitchen" }],
    },
    {
      slug: "margherita-pizza",
      name: "Margherita Pizza",
      description: "Classic Italian pizza with fresh mozzarella, basil and tomato.",
      countryCode: "it", countryName: "Italy", difficulty: "MEDIUM", proteinType: "VEGETARIAN", dietType: "VEGETARIAN",
      prepTimeMin: 30, cookTimeMin: 15, servings: 2, currency: "EUR", homePrepCost: 8, restaurantPrice: 14,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop",
      isPopular: true, popularityScore: 88, tags: ["italian", "cheese"], categories: ["vegetarian"],
      ingredients: [{ name: "Pizza Dough", quantity: 250, unit: "g" }, { name: "Mozzarella", quantity: 150, unit: "g" }],
      steps: ["Stretch dough", "Add tomato sauce", "Top with mozzarella and basil", "Bake at 250°C for 12 minutes"],
      nutrition: { calories: 520, protein: 22, carbohydrates: 58, fat: 24, fiber: 3, sodium: 680 },
      videos: [],
    },
    {
      slug: "chicken-teriyaki-bowl",
      name: "Chicken Teriyaki Bowl",
      description: "Savory teriyaki chicken with steamed rice and veggies.",
      countryCode: "jp", countryName: "Japan", difficulty: "EASY", proteinType: "CHICKEN", dietType: "HIGH_PROTEIN",
      prepTimeMin: 15, cookTimeMin: 20, servings: 2, currency: "JPY", homePrepCost: 650, restaurantPrice: 1200,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
      isPopular: true, isTrending: true, popularityScore: 92, tags: ["japanese", "high-protein"], categories: ["chicken", "healthy", "high-protein"],
      ingredients: [{ name: "Chicken Breast", quantity: 300, unit: "g" }, { name: "Soy Sauce", quantity: 30, unit: "ml" }],
      steps: ["Marinate chicken in teriyaki", "Pan-fry until golden", "Serve over rice with steamed broccoli"],
      nutrition: { calories: 480, protein: 42, carbohydrates: 38, fat: 18 },
      videos: [],
    },
  ];

  for (const r of sampleRecipes) {
    await Recipe.updateOne({ slug: r.slug }, r, { upsert: true });
  }
  console.log("[Seed] Recipes done");

  await mongoose.disconnect();
  console.log("[Seed] Complete");
}

seed().catch(e => { console.error(e); process.exit(1); });
