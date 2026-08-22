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

    if (req.method === 'GET') {
      const apiRes = await VeyraApiRouter.getNotifications(userId);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const apiRes = await VeyraApiRouter.addNotification(userId, body);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const notificationId = url.searchParams.get('id') || body.id;
      if (!notificationId) {
        return new Response(JSON.stringify({ success: false, error: 'Missing notification ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const apiRes = await VeyraApiRouter.markNotificationAsRead(userId, notificationId);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
