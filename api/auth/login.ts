import { VeyraApiRouter } from '../../src/services/backend/apiRouter';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const apiRes = await VeyraApiRouter.handleLogin(body);
    const success = Boolean(apiRes?.response?.success);
    const status = success ? 200 : 401;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiRes?.cookieHeader) {
      headers['Set-Cookie'] = apiRes.cookieHeader;
    }

    return new Response(JSON.stringify(apiRes?.response || { success: false, error: 'Login failed' }), {
      status,
      headers,
    });
  } catch (err: any) {
    console.error('Login Error:', err);
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500 });
  }
}
