import { Difficulty, DietType, ProteinType } from '@prisma/client';
import {
  jsonOk,
  preflightResponse,
  withApiErrors,
} from '../backend/apiResponse';
import {
  listRecipes,
  getRecipeDetail,
  RECIPE_SORT_OPTIONS,
  type RecipeSort,
} from '../backend/foodService';
import {
  invalidParam,
  isValidResourceId,
  methodNotAllowed,
  notFound,
  parseEnum,
  parseEnumList,
  parsePagination,
  sanitizeSearchQuery,
} from '../backend/validation';

export default async function handleRecipes(req: Request, recipeIdParam?: string) {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'GET') return methodNotAllowed();

  return withApiErrors(async () => {
    const url = new URL(req.url);

    // Single recipe detail via query param or explicit param
    const idParam = recipeIdParam || url.searchParams.get('id') || url.searchParams.get('slug');
    if (idParam) {
      if (!isValidResourceId(idParam)) return notFound('Recipe');
      const recipe = await getRecipeDetail(idParam);
      if (!recipe) return notFound('Recipe');
      return jsonOk(recipe);
    }

    const pagination = parsePagination(url);
    if (!pagination.ok) return pagination.response;

    const countryCodeRaw = url.searchParams.get('country');
    if (countryCodeRaw && !isValidResourceId(countryCodeRaw)) {
      return invalidParam('country', 'must be alphanumeric');
    }

    const categorySlugs = (url.searchParams.get('category') || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (categorySlugs.some((s) => !isValidResourceId(s))) {
      return invalidParam('category', 'slugs must be alphanumeric');
    }

    const proteinTypes = parseEnumList<ProteinType>(
      url.searchParams.get('proteinType'),
      Object.values(ProteinType)
    );
    if (proteinTypes === null) {
      return invalidParam(
        'proteinType',
        `must be one of: ${Object.values(ProteinType).join(', ')}`
      );
    }

    const dietTypes = parseEnumList<DietType>(
      url.searchParams.get('dietType'),
      Object.values(DietType)
    );
    if (dietTypes === null) {
      return invalidParam(
        'dietType',
        `must be one of: ${Object.values(DietType).join(', ')}`
      );
    }

    const difficulties = parseEnumList<Difficulty>(
      url.searchParams.get('difficulty'),
      Object.values(Difficulty)
    );
    if (difficulties === null) {
      return invalidParam(
        'difficulty',
        `must be one of: ${Object.values(Difficulty).join(', ')}`
      );
    }

    const sort = parseEnum<RecipeSort>(
      url.searchParams.get('sort'),
      RECIPE_SORT_OPTIONS
    );
    if (sort === null) {
      return invalidParam('sort', `must be one of: ${RECIPE_SORT_OPTIONS.join(', ')}`);
    }

    const flag = (name: string): boolean =>
      ['1', 'true'].includes((url.searchParams.get(name) || '').toLowerCase());

    const { items, total } = await listRecipes(
      {
        countryCode: countryCodeRaw || undefined,
        categorySlugs: categorySlugs.length ? categorySlugs : undefined,
        proteinTypes: proteinTypes.length ? proteinTypes : undefined,
        dietTypes: dietTypes.length ? dietTypes : undefined,
        difficulties: difficulties.length ? difficulties : undefined,
        searchQuery: sanitizeSearchQuery(url.searchParams.get('q')) || undefined,
        onlyPopular: flag('popular'),
        onlyTrending: flag('trending'),
        onlyFeatured: flag('featured'),
        sort: sort ?? undefined,
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
