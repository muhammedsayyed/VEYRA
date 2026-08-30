import {
  jsonOk,
  preflightResponse,
  withApiErrors,
} from '../../src/services/backend/apiResponse';
import { getRecipeDetail } from '../../src/services/backend/foodService';
import {
  isValidResourceId,
  methodNotAllowed,
  notFound,
} from '../../src/services/backend/validation';

/**
 * GET /api/recipes/:recipeId -> full recipe detail
 *
 * `:recipeId` accepts either the opaque recipe id or its unique slug.
 * Response includes ingredients (with exact quantities/units), ordered
 * preparation steps, nutrition, verified videos, categories and country.
 */
export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'GET') return methodNotAllowed();

  return withApiErrors(async () => {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const recipeId = segments[segments.length - 1] || '';

    if (!recipeId || !isValidResourceId(recipeId)) {
      return notFound('Recipe');
    }

    const recipe = await getRecipeDetail(recipeId);
    if (!recipe) return notFound('Recipe');

    return jsonOk(recipe);
  });
}
