import {
  jsonOk,
  preflightResponse,
  withApiErrors,
} from '../src/services/backend/apiResponse';
import { listCategories } from '../src/services/backend/foodService';
import { methodNotAllowed } from '../src/services/backend/validation';

/**
 * GET /api/categories -> all recipe categories with recipe counts
 */
export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'GET') return methodNotAllowed();

  return withApiErrors(async () => {
    const categories = await listCategories();
    return jsonOk(categories);
  });
}
