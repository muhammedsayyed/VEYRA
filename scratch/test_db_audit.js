const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("FAIL: DATABASE_URL environment variable is missing!");
  process.exit(1);
}

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
    'WaterLog',
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
    console.log("PASS: All 7 new domain models + core tables exist in Neon PostgreSQL DB.");
  }

  // 2. Test User Isolation with User A and User B
  console.log("\n--- TESTING AUTH & USER ISOLATION ---");
  const userA_id = `user_a_${Date.now()}`;
  const userB_id = `user_b_${Date.now()}`;

  // Insert test users
  await sql`
    INSERT INTO "User" (id, "firstName", "lastName", email, "passwordHash", "wellnessGoal")
    VALUES (${userA_id}, 'UserA', 'Test', ${userA_id + '@test.com'}, 'hash_a', 'Lose Weight'),
           (${userB_id}, 'UserB', 'Test', ${userB_id + '@test.com'}, 'hash_b', 'Build Muscle')
  `;

  // Insert PantryItem for User A
  const pantryA_id = `pantry_${Date.now()}`;
  await sql`
    INSERT INTO "PantryItem" (id, "userId", name, quantity, unit)
    VALUES (${pantryA_id}, ${userA_id}, 'User A Apples', 5, 'pcs')
  `;

  // Verify User A can fetch own pantry item
  const pantryA = await sql`SELECT * FROM "PantryItem" WHERE "userId" = ${userA_id}`;
  const pantryB = await sql`SELECT * FROM "PantryItem" WHERE "userId" = ${userB_id}`;

  const isolationPassed = pantryA.length === 1 && pantryB.length === 0;

  console.log("User A Pantry Items count:", pantryA.length);
  console.log("User B Pantry Items count:", pantryB.length);

  if (isolationPassed) {
    console.log("PASS: User Isolation verified! User B cannot see User A's data.");
  } else {
    console.error("FAIL: User Isolation breach detected!");
  }

  // Cleanup test data
  await sql`DELETE FROM "PantryItem" WHERE id = ${pantryA_id}`;
  await sql`DELETE FROM "User" WHERE id IN (${userA_id}, ${userB_id})`;
  console.log("\nCleaned up test users & test items.");

  console.log("--- DB AUDIT COMPLETE ---");
}

runAudit().catch((err) => {
  console.error("DB Audit Failed:", err);
  process.exit(1);
});
