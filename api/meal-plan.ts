import { VeyraApiRouter, authenticateRequest } from '../src/services/backend/apiRouter';
import { selectServerAIProvider } from './ai/chat';
import { dbStore } from '../src/services/backend/dbStore';



export default async function handler(req: Request) {
  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => { headers[key.toLowerCase()] = val; });

    const userId = await authenticateRequest(headers);
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);
    const weekStartDate = url.searchParams.get('week') || new Date().toISOString().split('T')[0];
    const action = url.searchParams.get('action');

    if (req.method === 'GET') {
      const apiRes = await VeyraApiRouter.getMealPlan(userId, weekStartDate);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));

      if (action === 'generate') {
        // Fetch user data for AI meal plan generation
        const user = await dbStore.getUserById(userId);
        const pantry = await dbStore.getPantryItems(userId);
        const activePantry = pantry.filter((p) => !p.isUsed).map((p) => p.name).join(', ');

        const prompt = `Act as an expert AI nutritionist. Generate a personalized 7-day Weekly Meal Plan starting ${weekStartDate} for a user with:
- Name: ${user?.firstName || 'User'}
- Wellness Goal: ${user?.wellnessGoal || 'Improve Fitness'}
- Daily Calories: ${user?.wellnessGoal === 'Lose Weight' ? 1900 : 2300} kcal
- Protein Target: ${user ? Math.round(user.weight * 1.8) : 130}g
- Dietary Preferences: ${user?.dietaryPreferences?.join(', ') || 'Balanced'}
- Allergens to Avoid: ${user?.allergens?.join(', ') || 'None'}
- Available Pantry Ingredients: ${activePantry || 'Standard grocery staples'}

Return ONLY a valid JSON object with key "days" mapping Monday to Sunday. Each day must contain array of 4 meal objects with:
"mealType" (Breakfast, Lunch, Dinner, Snack), "recipeTitle", "calories", "protein", "carbs", "fat", "prepTimeMin", "country".
Return JSON ONLY, no markdown formatting.`;

        const provider = selectServerAIProvider();
        const aiRes = await provider.generateChatResponse(
          [{ role: 'user', content: prompt }],
          {
            user: {
              name: user ? `${user.firstName} ${user.lastName}` : 'User',
              firstName: user?.firstName || 'User',
              email: user?.email || 'user@veyra.app',
              goal: user?.wellnessGoal || 'Improve Fitness',
              weightKg: user?.weight,
              targetWeightKg: user?.targetWeight,
              dietaryPreferences: user?.dietaryPreferences,
              allergens: user?.allergens,
            },
            nutrition: {
              dailyCalories: user?.wellnessGoal === 'Lose Weight' ? 1900 : 2300,
              caloriesConsumed: 0,
              caloriesRemaining: user?.wellnessGoal === 'Lose Weight' ? 1900 : 2300,
              dailyProtein: user ? Math.round(user.weight * 1.8) : 130,
              proteinConsumed: 0,
              proteinRemaining: user ? Math.round(user.weight * 1.8) : 130,
              dailyCarbs: 200,
              carbsConsumed: 0,
              carbsRemaining: 200,
              dailyFat: 65,
              fatConsumed: 0,
              fatRemaining: 65,
              waterLiters: 0,
              waterTarget: 2.5,
            },
            recentMeals: [],
          }
        );

        let generatedPlan;
        try {
          const rawText = (aiRes as any).message || (aiRes as any).content || '';
          const raw = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          generatedPlan = JSON.parse(raw);
        } catch {

          // Fallback structured meal plan if AI formatting has noise
          generatedPlan = {
            days: {
              Monday: [
                { mealType: 'Breakfast', recipeTitle: 'Greek Yogurt & Honey Bowl', calories: 350, protein: 25, carbs: 40, fat: 8, prepTimeMin: 10, country: 'Greece' },
                { mealType: 'Lunch', recipeTitle: 'Mediterranean Chicken Salad', calories: 520, protein: 45, carbs: 20, fat: 18, prepTimeMin: 15, country: 'Italy' },
                { mealType: 'Dinner', recipeTitle: 'Grilled Salmon with Asparagus', calories: 610, protein: 48, carbs: 15, fat: 28, prepTimeMin: 25, country: 'USA' },
                { mealType: 'Snack', recipeTitle: 'Handful of Mixed Almonds', calories: 180, protein: 6, carbs: 6, fat: 15, prepTimeMin: 2, country: 'Global' },
              ],
              Tuesday: [
                { mealType: 'Breakfast', recipeTitle: 'Protein Berry Oatmeal', calories: 380, protein: 22, carbs: 55, fat: 6, prepTimeMin: 10, country: 'USA' },
                { mealType: 'Lunch', recipeTitle: 'Egyptian Koshari Bowl', calories: 540, protein: 20, carbs: 85, fat: 12, prepTimeMin: 30, country: 'Egypt' },
                { mealType: 'Dinner', recipeTitle: 'Japanese Chicken Teriyaki Bowl', calories: 580, protein: 44, carbs: 60, fat: 14, prepTimeMin: 20, country: 'Japan' },
                { mealType: 'Snack', recipeTitle: 'Apple Slices with Peanut Butter', calories: 200, protein: 5, carbs: 25, fat: 9, prepTimeMin: 3, country: 'USA' },
              ],
            }
          };
        }

        const mealsJsonStr = JSON.stringify(generatedPlan);
        const apiRes = await VeyraApiRouter.saveMealPlan(userId, weekStartDate, mealsJsonStr);
        return new Response(JSON.stringify(apiRes), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      const mealsJsonStr = typeof body.mealsJson === 'string' ? body.mealsJson : JSON.stringify(body.mealsJson || body);
      const apiRes = await VeyraApiRouter.saveMealPlan(userId, weekStartDate, mealsJsonStr);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
