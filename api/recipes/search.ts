import {
  jsonOk,
  preflightResponse,
  withApiErrors,
} from '../../src/services/backend/apiResponse';
import { listRecipes } from '../../src/services/backend/foodService';
import {
  invalidParam,
  isValidResourceId,
  methodNotAllowed,
  parsePagination,
  sanitizeSearchQuery,
} from '../../src/services/backend/validation';

/**
 * GET /api/recipes/search?q=<term>&country=eg&category=beef&page=1&limit=20
 *
 * Backend-side search across recipe name/description, country name/cuisine,
 * category names/slugs and canonical ingredient names.
 */
export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'GET') return methodNotAllowed();

  return withApiErrors(async () => {
    const url = new URL(req.url);

    const q = sanitizeSearchQuery(url.searchParams.get('q'), 80);
    if (!q) {
      return invalidParam('q', 'a search term is required');
    }

    const pagination = parsePagination(url);
    if (!pagination.ok) return pagination.response;

    const countryRaw = url.searchParams.get('country');
    if (countryRaw && !isValidResourceId(countryRaw)) {
      return invalidParam('country', 'must be alphanumeric');
    }

    const categorySlugs = (url.searchParams.get('category') || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (categorySlugs.some((s) => !isValidResourceId(s))) {
      return invalidParam('category', 'slugs must be alphanumeric');
    }

    const { items, total } = await listRecipes(
      {
        searchQuery: q,
        countryCode: countryRaw || undefined,
        categorySlugs: categorySlugs.length ? categorySlugs : undefined,
        sort: 'popular',
      },
      pagination.value
    );

    const totalPages = Math.max(1, Math.ceil(total / pagination.value.limit));
    return jsonOk(items, {
      pagination: {
        total,
        totalPages,
        currentPage: pagination.value.page,
        limit: pagination.value.limit,
      },
    });
  });
}
