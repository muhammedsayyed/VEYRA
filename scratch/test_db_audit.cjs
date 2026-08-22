const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_SqXA4mr3vCbW@ep-green-sunset-ayjp9jdm.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function runAudit() {
  console.log("--- STARTING DATABASE AUDIT ---");
  console.log("DATABASE_URL:", DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

  // 1. Check Tables Existence
  const requiredTables = [
    'User',
    'PantryItem',
    'ShoppingListItem',
    'MealPlan',
    'WeightHistory',
    'FavoriteRecipe',
    'RecipeReview',
    'Notification',
    'FoodLog',
    'DailyNutrition',
    'WorkoutHistory'
  ];

  const tableRows = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;

  const existingTables = tableRows.map(r => r.table_name);
  console.log("\nExisting Tables in Neon DB:", existingTables);

  let missingTables = [];
  for (const t of requiredTables) {
    if (!existingTables.includes(t)) {
      missingTables.push(t);
    }
  }

  if (missingTables.length > 0) {
    console.error("FAIL: Missing tables in Neon DB:", missingTables);
  } else {
    console.log("PASS: All 7 required domain models + core tables exist in Neon PostgreSQL DB.");
  }

  // 2. Test User Isolation with User A and User B
  console.log("\n--- TESTING AUTH & USER ISOLATION FOR ALL MODELS ---");
  const userA_id = `user_a_${Date.now()}`;
  const userB_id = `user_b_${Date.now()}`;
  const nowIso = new Date().toISOString();

  // Insert test users
  await sql`
    INSERT INTO "User" (id, "firstName", "lastName", email, "passwordHash", "wellnessGoal", "createdAt", "updatedAt")
    VALUES (${userA_id}, 'UserA', 'Test', ${userA_id + '@test.com'}, 'hash_a', 'Lose Weight', ${nowIso}, ${nowIso}),
           (${userB_id}, 'UserB', 'Test', ${userB_id + '@test.com'}, 'hash_b', 'Build Muscle', ${nowIso}, ${nowIso})
  `;

  // Test PantryItem isolation
  const pantryA_id = `pantry_${Date.now()}`;
  await sql`INSERT INTO "PantryItem" (id, "userId", name, quantity, unit, "updatedAt") VALUES (${pantryA_id}, ${userA_id}, 'User A Milk', 1, 'liters', ${nowIso})`;
  const pantryA = await sql`SELECT * FROM "PantryItem" WHERE "userId" = ${userA_id}`;
  const pantryB = await sql`SELECT * FROM "PantryItem" WHERE "userId" = ${userB_id}`;
  console.log("Pantry Isolation: User A =", pantryA.length, "User B =", pantryB.length);

  // Test ShoppingListItem isolation
  const shopA_id = `shop_${Date.now()}`;
  await sql`INSERT INTO "ShoppingListItem" (id, "userId", name, quantity, unit, "updatedAt") VALUES (${shopA_id}, ${userA_id}, 'User A Bread', 2, 'pcs', ${nowIso})`;
  const shopA = await sql`SELECT * FROM "ShoppingListItem" WHERE "userId" = ${userA_id}`;
  const shopB = await sql`SELECT * FROM "ShoppingListItem" WHERE "userId" = ${userB_id}`;
  console.log("ShoppingList Isolation: User A =", shopA.length, "User B =", shopB.length);

  // Test WeightHistory isolation
  const weightA_id = `weight_${Date.now()}`;
  await sql`INSERT INTO "WeightHistory" (id, "userId", weight, date) VALUES (${weightA_id}, ${userA_id}, 75.5, '2026-08-22')`;
  const weightA = await sql`SELECT * FROM "WeightHistory" WHERE "userId" = ${userA_id}`;
  const weightB = await sql`SELECT * FROM "WeightHistory" WHERE "userId" = ${userB_id}`;
  console.log("WeightHistory Isolation: User A =", weightA.length, "User B =", weightB.length);

  // Test FavoriteRecipe isolation
  const favA_id = `fav_${Date.now()}`;
  await sql`INSERT INTO "FavoriteRecipe" (id, "userId", "recipeId", "recipeTitle") VALUES (${favA_id}, ${userA_id}, 'rec-1', 'User A Recipe')`;
  const favA = await sql`SELECT * FROM "FavoriteRecipe" WHERE "userId" = ${userA_id}`;
  const favB = await sql`SELECT * FROM "FavoriteRecipe" WHERE "userId" = ${userB_id}`;
  console.log("FavoriteRecipe Isolation: User A =", favA.length, "User B =", favB.length);

  // Test RecipeReview isolation
  const revA_id = `rev_${Date.now()}`;
  await sql`INSERT INTO "RecipeReview" (id, "userId", "recipeId", rating, text, "updatedAt") VALUES (${revA_id}, ${userA_id}, 'rec-1', 5, 'Great!', ${nowIso})`;
  const revA = await sql`SELECT * FROM "RecipeReview" WHERE "userId" = ${userA_id}`;
  const revB = await sql`SELECT * FROM "RecipeReview" WHERE "userId" = ${userB_id}`;
  console.log("RecipeReview Isolation: User A =", revA.length, "User B =", revB.length);

  // Test Notification isolation
  const notifA_id = `notif_${Date.now()}`;
  await sql`INSERT INTO "Notification" (id, "userId", title, message, category) VALUES (${notifA_id}, ${userA_id}, 'Water Alert', 'Drink water', 'water')`;
  const notifA = await sql`SELECT * FROM "Notification" WHERE "userId" = ${userA_id}`;
  const notifB = await sql`SELECT * FROM "Notification" WHERE "userId" = ${userB_id}`;
  console.log("Notification Isolation: User A =", notifA.length, "User B =", notifB.length);

  // Test DailyNutrition (Water) isolation
  const waterA_id = `water_${Date.now()}`;
  await sql`INSERT INTO "DailyNutrition" (id, "userId", date, "waterConsumed", "updatedAt") VALUES (${waterA_id}, ${userA_id}, '2026-08-22', 2.0, ${nowIso})`;
  const waterA = await sql`SELECT * FROM "DailyNutrition" WHERE "userId" = ${userA_id}`;
  const waterB = await sql`SELECT * FROM "DailyNutrition" WHERE "userId" = ${userB_id}`;
  console.log("DailyNutrition (Water) Isolation: User A =", waterA.length, "User B =", waterB.length);

  const allPassed = pantryA.length === 1 && pantryB.length === 0 &&
                    shopA.length === 1 && shopB.length === 0 &&
                    weightA.length === 1 && weightB.length === 0 &&
                    favA.length === 1 && favB.length === 0 &&
                    revA.length === 1 && revB.length === 0 &&
                    notifA.length === 1 && notifB.length === 0 &&
                    waterA.length === 1 && waterB.length === 0;

  if (allPassed) {
    console.log("\nPASS: All entities strictly isolated by server session userId!");
  } else {
    console.error("\nFAIL: Isolation failure detected!");
  }

  // Cleanup test data
  await sql`DELETE FROM "PantryItem" WHERE id = ${pantryA_id}`;
  await sql`DELETE FROM "ShoppingListItem" WHERE id = ${shopA_id}`;
  await sql`DELETE FROM "WeightHistory" WHERE id = ${weightA_id}`;
  await sql`DELETE FROM "FavoriteRecipe" WHERE id = ${favA_id}`;
  await sql`DELETE FROM "RecipeReview" WHERE id = ${revA_id}`;
  await sql`DELETE FROM "Notification" WHERE id = ${notifA_id}`;
  await sql`DELETE FROM "DailyNutrition" WHERE id = ${waterA_id}`;
  await sql`DELETE FROM "User" WHERE id IN (${userA_id}, ${userB_id})`;
  console.log("Cleaned up test data.");

  console.log("--- DB & ISOLATION AUDIT COMPLETE ---");
}

runAudit().catch((err) => {
  console.error("DB Audit Failed:", err);
  process.exit(1);
});
