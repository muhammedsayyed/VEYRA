const { CloudAIProvider } = require('./cloudProviderWrapper.cjs');

// Test Cloud AI Provider with real user context
async function testAI() {
  console.log("--- TESTING OPENROUTER CLOUD AI ---");
  const provider = new CloudAIProvider();
  
  const testContext = {
    user: {
      name: "Muhammed Sayyed",
      firstName: "Muhammed",
      email: "muhammed@veyra.app",
      goal: "Build Muscle",
      weightKg: 82,
      targetWeightKg: 85,
      activityLevel: "moderate",
      dietaryPreferences: ["High Protein"],
      allergens: ["None"]
    },
    nutrition: {
      dailyCalories: 2600,
      caloriesConsumed: 1800,
      caloriesRemaining: 800,
      dailyProtein: 160,
      proteinConsumed: 120,
      proteinRemaining: 40,
      dailyCarbs: 250,
      carbsConsumed: 180,
      carbsRemaining: 70,
      dailyFat: 75,
      fatConsumed: 55,
      fatRemaining: 20,
      waterLiters: 2.2,
      waterTarget: 3.0
    },
    recentMeals: [
      { name: "Oatmeal & Protein Powder", calories: 450, protein: 35, time: "08:30 AM" },
      { name: "Grilled Chicken & Rice", calories: 650, protein: 55, time: "01:15 PM" }
    ],
    pantryItems: [
      { name: "Eggs", quantity: 12, unit: "pcs" },
      { name: "Greek Yogurt", quantity: 2, unit: "packs" }
    ],
    shoppingList: [
      { name: "Whey Isolate", quantity: 1, unit: "tub", isPurchased: false }
    ],
    weightHistory: [
      { weight: 81.5, date: "2026-08-15" },
      { weight: 82.0, date: "2026-08-22" }
    ]
  };

  const messages = [
    { role: "user", content: "What should I eat tonight to hit my remaining 40g protein target using my pantry items?" }
  ];

  console.log("Sending query to OpenRouter...");
  const res = await provider.generateChatResponse(messages, testContext);

  console.log("\nResponse Status:", res.isUnavailable ? "UNAVAILABLE" : "SUCCESS");
  console.log("Provider:", res.provider);
  console.log("Latency:", res.latencyMs, "ms");
  console.log("\nAI Response Message:\n", res.message || res.error);

  if (res.isUnavailable || !res.message) {
    console.error("FAIL: Cloud AI query failed!");
    process.exit(1);
  } else {
    console.log("\nPASS: Real OpenRouter Cloud AI response received successfully!");
  }
}

testAI().catch((err) => {
  console.error("AI Test Error:", err);
  process.exit(1);
});
