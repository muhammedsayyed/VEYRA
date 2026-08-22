import { VeyraApiRouter, authenticateRequest } from '../src/services/backend/apiRouter';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => { headers[key.toLowerCase()] = val; });

    const userId = await authenticateRequest(headers);
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (req.method === 'GET') {
      const apiRes = await VeyraApiRouter.getDailyNutrition(userId, date);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const waterConsumed = Number(body.waterConsumed);
      if (isNaN(waterConsumed)) {
        return new Response(JSON.stringify({ success: false, error: 'Valid waterConsumed amount is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const apiRes = await VeyraApiRouter.updateWater(userId, date, waterConsumed);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
