import { VeyraApiRouter, authenticateRequest } from '../backend/apiRouter';

export default async function handleShoppingList(req: Request) {
  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => { headers[key.toLowerCase()] = val; });

    const userId = await authenticateRequest(headers);
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'GET') {
      const res = await VeyraApiRouter.getShoppingList(userId);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (body.action === 'batch') {
        const res = await VeyraApiRouter.addBatchShoppingList(userId, body.items || []);
        return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
      }
      const res = await VeyraApiRouter.addShoppingListItem(userId, body);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      const res = await VeyraApiRouter.updateShoppingListItem(userId, body.id, body.updates);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const action = url.searchParams.get('action');

      if (action === 'clear-purchased') {
        const res = await VeyraApiRouter.clearPurchasedShoppingList(userId);
        return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
      }

      if (action === 'clear-all') {
        const res = await VeyraApiRouter.clearEntireShoppingList(userId);
        return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
      }

      const id = url.searchParams.get('id');
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'Missing id parameter' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const res = await VeyraApiRouter.deleteShoppingListItem(userId, id);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (err: any) {
    console.error('Shopping List Error:', err);
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500 });
  }
}
