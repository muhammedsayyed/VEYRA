import { VeyraApiRouter, authenticateRequest } from '../backend/apiRouter';

export default async function handleFavorites(req: Request) {
  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => { headers[key.toLowerCase()] = val; });

    const userId = await authenticateRequest(headers);
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'GET') {
      const res = await VeyraApiRouter.getFavorites(userId);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const res = await VeyraApiRouter.addFavorite(userId, body);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE') {
      const body = await req.json().catch(() => ({}));
      const res = await VeyraApiRouter.removeFavorite(userId, body.recipeId);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (err: any) {
    console.error('Favorites Error:', err);
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500 });
  }
}
