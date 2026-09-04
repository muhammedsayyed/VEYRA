import { VeyraApiRouter, authenticateRequest } from '../backend/apiRouter';

export default async function handleReviews(req: Request) {
  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => { headers[key.toLowerCase()] = val; });

    const url = new URL(req.url);

    if (req.method === 'GET') {
      const recipeId = url.searchParams.get('recipeId');
      if (!recipeId) {
        return new Response(JSON.stringify({ success: false, error: 'recipeId is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const res = await VeyraApiRouter.getRecipeReviews(recipeId);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    const userId = await authenticateRequest(headers);
    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { recipeId, rating, text } = body;
      const res = await VeyraApiRouter.addRecipeReview(userId, recipeId, rating, text);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      const { reviewId, rating, text } = body;
      const res = await VeyraApiRouter.updateRecipeReview(userId, reviewId, rating, text);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE') {
      const body = await req.json().catch(() => ({}));
      const { reviewId } = body;
      const res = await VeyraApiRouter.deleteRecipeReview(userId, reviewId);
      return new Response(JSON.stringify(res), { status: res.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (err: any) {
    console.error('Reviews Error:', err);
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500 });
  }
}
