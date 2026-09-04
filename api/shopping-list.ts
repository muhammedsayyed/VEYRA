import { VeyraApiRouter, authenticateRequest } from '../src/services/backend/apiRouter';



export default async function handler(req: Request) {
  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => { headers[key.toLowerCase()] = val; });

    const userId = await authenticateRequest(headers);
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (req.method === 'GET') {
      const apiRes = await VeyraApiRouter.getShoppingList(userId);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      if (Array.isArray(body.items)) {
        const apiRes = await VeyraApiRouter.addBatchShoppingList(userId, body.items);
        return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
      }
      const apiRes = await VeyraApiRouter.addShoppingListItem(userId, body);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const itemId = url.searchParams.get('id') || body.id;
      if (!itemId) {
        return new Response(JSON.stringify({ success: false, error: 'Missing shopping item ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const apiRes = await VeyraApiRouter.updateShoppingListItem(userId, itemId, body);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE') {
      if (action === 'clear-purchased') {
        const apiRes = await VeyraApiRouter.clearPurchasedShoppingList(userId);
        return new Response(JSON.stringify(apiRes), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (action === 'clear-all') {
        const apiRes = await VeyraApiRouter.clearEntireShoppingList(userId);
        return new Response(JSON.stringify(apiRes), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      const itemId = url.searchParams.get('id');
      if (!itemId) {
        return new Response(JSON.stringify({ success: false, error: 'Missing shopping item ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const apiRes = await VeyraApiRouter.deleteShoppingListItem(userId, itemId);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
