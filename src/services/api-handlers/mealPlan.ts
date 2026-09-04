import { VeyraApiRouter, authenticateRequest } from '../backend/apiRouter';
import { selectServerAIProvider } from './aiChat';
import { dbStore } from '../backend/dbStore';

export default async function handleMealPlan(req: Request) {
  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => { headers[key.toLowerCase()] = val; });

    const userId = await authenticateRequest(headers);
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);

    if (req.method === 'GET') {
      const week = url.searchParams.get('week') || new Date().toISOString().split('T')[0];
      const res = await VeyraApiRouter.getMealPlan(userId, week);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));

      if (body.action === 'ai_generate') {
        const user = await dbStore.getUserById(userId);
        const provider = selectServerAIProvider();
        const goal = user?.wellnessGoal || 'Healthy Living';
        const prompt = `Generate a 7-day healthy meal plan for a person with goal "${goal}", daily calories target around 2000 kcal. Return JSON format with days: Monday through Sunday, each having breakfast, lunch, dinner, snack. Each meal has name, calories, protein, carbs, fats. Output pure valid JSON only without markdown fences.`;

        const aiResponse = await provider.generateChatResponse(
          [{ role: 'user', content: prompt }],
          {
            user: {
              name: `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim(),
              firstName: user?.firstName || 'User',
              email: user?.email || '',
              goal: goal,
            },
            nutrition: {
              dailyCalories: 2000,
              caloriesConsumed: 0,
              caloriesRemaining: 2000,
              dailyProtein: 120,
              proteinConsumed: 0,
              proteinRemaining: 120,
              dailyCarbs: 220,
              carbsConsumed: 0,
              carbsRemaining: 220,
              dailyFat: 65,
              fatConsumed: 0,
              fatRemaining: 65,
              waterLiters: 2.5,
              waterTarget: 3,
            },
            recentMeals: [],
          }
        );

        const replyContent = aiResponse.message || '';
        let parsedPlan: any = null;
        try {
          const cleanJson = replyContent.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedPlan = JSON.parse(cleanJson);
        } catch {
          parsedPlan = { textPlan: replyContent };
        }

        const week = body.week || new Date().toISOString().split('T')[0];
        const saveRes = await VeyraApiRouter.saveMealPlan(userId, week, JSON.stringify(parsedPlan));

        return new Response(JSON.stringify({ success: true, data: saveRes.data || parsedPlan }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const week = body.week || new Date().toISOString().split('T')[0];
      const res = await VeyraApiRouter.saveMealPlan(userId, week, typeof body.plan === 'string' ? body.plan : JSON.stringify(body.plan || {}));
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (err: any) {
    console.error('Meal Plan Error:', err);
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500 });
  }
}
