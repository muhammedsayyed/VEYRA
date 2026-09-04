import {
  jsonOk,
  preflightResponse,
  withApiErrors,
} from '../backend/apiResponse';
import { listCategories } from '../backend/foodService';
import { methodNotAllowed } from '../backend/validation';

export default async function handleCategories(req: Request) {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'GET') return methodNotAllowed();

  return withApiErrors(async () => {
    const categories = await listCategories();
    return jsonOk(categories);
  });
}
