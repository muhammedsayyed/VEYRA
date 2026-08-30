import {
  jsonOk,
  preflightResponse,
  withApiErrors,
} from '../../src/services/backend/apiResponse';
import { listRecipes } from '../../src/services/backend/foodService';
import {
  invalidParam,
  isValidResourceId,
  MAX_PAGE_LIMIT,
  methodNotAllowed,
  parsePagination,
} from '../../src/services/backend/validation';

/**
 * GET /api/recipes/popular?country=eg&limit=10
 * GET /api/recipes/popular?type=trending|featured
 *
 * Backed by explicit database flags (isPopular/isTrending/isFeatured) and
 * popularityScore ordering - never hardcoded on the frontend.
 */
export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'GET') return methodNotAllowed();

  return withApiErrors(async () => {
    const url = new URL(req.url);

    const typeRaw = (url.searchParams.get('type') || 'popular').toLowerCase();
    const flagMap: Record<string, 'onlyPopular' | 'onlyTrending' | 'onlyFeatured'> = {
      popular: 'onlyPopular',
      trending: 'onlyTrending',
      featured: 'onlyFeatured',
    };
    const flagKey = flagMap[typeRaw];
    if (!flagKey) {
      return invalidParam('type', 'must be one of: popular, trending, featured');
    }

    const countryRaw = url.searchParams.get('country');
    if (countryRaw && !isValidResourceId(countryRaw)) {
      return invalidParam('country', 'must be alphanumeric');
    }

    // Popular lists are small by nature; cap them tighter than the global max.
    const limitRaw = url.searchParams.get('limit');
    let limit = 12;
    if (limitRaw !== null) {
      const parsed = Number.parseInt(limitRaw, 10);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 24) {
        return invalidParam('limit', 'must be an integer between 1 and 24');
      }
      limit = parsed;
    }

    const { items } = await listRecipes(
      {
        countryCode: countryRaw || undefined,
        [flagKey]: true,
        sort: 'popular',
      },
      { page: 1, limit, skip: 0 }
    );

    return jsonOk(items);
  });
}
