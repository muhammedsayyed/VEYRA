import { VeyraApiRouter, authenticateRequest } from '../backend/apiRouter';

export default async function handleWater(req: Request) {
  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => { headers[key.toLowerCase()] = val; });

    const userId = await authenticateRequest(headers);
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { date, waterConsumed } = body;
      const targetDate = date || new Date().toISOString().split('T')[0];
      const res = await VeyraApiRouter.updateWater(userId, targetDate, waterConsumed || 0);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (err: any) {
    console.error('Water Error:', err);
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500 });
  }
}
