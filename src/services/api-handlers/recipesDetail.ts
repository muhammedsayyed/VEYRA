import {
  jsonOk,
  preflightResponse,
  withApiErrors,
} from '../backend/apiResponse';
import { getRecipeDetail } from '../backend/foodService';
import {
  isValidResourceId,
  methodNotAllowed,
  notFound,
} from '../backend/validation';

export default async function handleRecipeDetail(req: Request, recipeIdParam?: string) {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'GET') return methodNotAllowed();

  return withApiErrors(async () => {
    let recipeId = recipeIdParam;
    if (!recipeId) {
      const url = new URL(req.url);
      const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
      recipeId = segments[segments.length - 1] || '';
    }

    if (!recipeId || !isValidResourceId(recipeId)) {
      return notFound('Recipe');
    }

    const recipe = await getRecipeDetail(recipeId);
    if (!recipe) return notFound('Recipe');

    return jsonOk(recipe);
  });
}
