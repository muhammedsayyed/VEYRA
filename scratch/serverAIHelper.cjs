function buildSystemPrompt(context) {
  let prompt = `You are Veyra AI, an elite personal nutritionist, wellness strategist, and chef.
Your primary role is to guide the user toward their wellness goal with evidence-based nutrition advice, authentic global recipes, and actionable encouragement.

### CURRENT USER PROFILE & CONTEXT:
`;

  if (context?.user) {
    const u = context.user;
    prompt += `- User Name: ${u.name} (FirstName: ${u.firstName})
- Primary Goal: ${u.goal}
- Weight: ${u.weightKg || 'Not specified'} kg (Target: ${u.targetWeightKg || 'Not specified'} kg)
- Dietary Preferences: ${u.dietaryPreferences?.join(', ') || 'None'}
- Allergens to Avoid: ${u.allergens?.join(', ') || 'None'}
`;
  }

  if (context?.nutrition) {
    const n = context.nutrition;
    prompt += `- Daily Target Calories: ${n.dailyCalories} kcal (Consumed: ${n.caloriesConsumed} kcal, Remaining: ${n.caloriesRemaining} kcal)
- Protein Target: ${n.dailyProtein} g (Consumed: ${n.proteinConsumed} g, Remaining: ${n.proteinRemaining} g)
- Carbs Target: ${n.dailyCarbs} g (Consumed: ${n.carbsConsumed} g, Remaining: ${n.carbsRemaining} g)
- Fat Target: ${n.dailyFat} g (Consumed: ${n.fatConsumed} g, Remaining: ${n.fatRemaining} g)
- Hydration: ${n.waterLiters} L / ${n.waterTarget} L target
`;
  }

  if (context?.pantryItems && context.pantryItems.length > 0) {
    prompt += `- Smart Pantry Available Items: ${context.pantryItems.map(p => `${p.name} (${p.quantity} ${p.unit})`).join(', ')}\n`;
  }

  if (context?.recentMeals && context.recentMeals.length > 0) {
    prompt += `- Recent Meals Logged Today: ${context.recentMeals.map(m => `${m.name} (${m.calories} kcal, ${m.protein}g protein)`).join(', ')}\n`;
  }

  prompt += `
Always provide concise, warm, helpful, and highly personalized advice using the user's real context. Never make up fake data.`;
  return prompt;
}

module.exports = { buildSystemPrompt };
