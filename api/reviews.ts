import { VeyraApiRouter, authenticateRequest } from '../src/services/backend/apiRouter';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => { headers[key.toLowerCase()] = val; });

    const url = new URL(req.url);

    if (req.method === 'GET') {
      const recipeId = url.searchParams.get('recipeId');
      if (!recipeId) {
        return new Response(JSON.stringify({ success: false, error: 'Missing recipeId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const apiRes = await VeyraApiRouter.getRecipeReviews(recipeId);
      return new Response(JSON.stringify(apiRes), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const userId = await authenticateRequest(headers);
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      if (!body.recipeId || !body.rating || !body.text) {
        return new Response(JSON.stringify({ success: false, error: 'recipeId, rating (1-5), and text review are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const apiRes = await VeyraApiRouter.addRecipeReview(userId, body.recipeId, Number(body.rating), body.text);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const reviewId = url.searchParams.get('id') || body.id;
      if (!reviewId || !body.rating || !body.text) {
        return new Response(JSON.stringify({ success: false, error: 'Missing review ID, rating, or text' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const apiRes = await VeyraApiRouter.updateRecipeReview(userId, reviewId, Number(body.rating), body.text);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE') {
      const reviewId = url.searchParams.get('id');
      if (!reviewId) {
        return new Response(JSON.stringify({ success: false, error: 'Missing review ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const apiRes = await VeyraApiRouter.deleteRecipeReview(userId, reviewId);
      return new Response(JSON.stringify(apiRes), { status: apiRes.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
