import { Prisma, Difficulty, DietType, ProteinType } from '@prisma/client';
import { prisma } from './prisma';
import type { Pagination } from './validation';

/**
 * Food system data access layer.
 * All queries are server-side filtered, paginated and shaped here so that
 * API routes stay thin and the frontend never receives unbounded payloads.
 */

// ---------------------------------------------------------------------------
// Public DTOs (stable shapes the future frontend can rely on)
// ---------------------------------------------------------------------------

export interface NutritionDto {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  saturatedFat: number | null;
}

export interface IngredientLineDto {
  name: string;
  quantity: number | null;
  unit: string | null;
  note: string | null;
}

export interface RecipeVideoDto {
  youtubeVideoId: string;
  youtubeUrl: string;
  videoTitle: string | null;
  channelName: string | null;
}

export interface CategoryRefDto {
  slug: string;
  name: string;
}

export interface CountryRefDto {
  code: string;
  name: string;
  cuisineLabel: string;
}

export interface RecipeSummaryDto {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  country: CountryRefDto;
  difficulty: Difficulty;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  totalTimeMin: number | null;
  servings: number;
  nutrition: NutritionDto | null;
  homePrepCost: number | null;
  restaurantPrice: number | null;
  currency: string | null;
  isPopular: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  proteinType: ProteinType | null;
  dietType: DietType | null;
  tags: string[];
  categories: CategoryRefDto[];
}

export interface RecipeDetailDto extends RecipeSummaryDto {
  description: string | null;
  servingSize: string | null;
  ingredients: IngredientLineDto[];
  steps: Array<{ position: number; instruction: string }>;
  videos: RecipeVideoDto[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export const RECIPE_SORT_OPTIONS = ['popular', 'newest', 'time'] as const;
export type RecipeSort = (typeof RECIPE_SORT_OPTIONS)[number];

// ---------------------------------------------------------------------------
// Internal query shapes
// ---------------------------------------------------------------------------

const summaryInclude = {
  country: { select: { code: true, name: true, cuisineLabel: true } },
  nutrition: {
    select: {
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
      fiber: true,
      sugar: true,
      sodium: true,
      saturatedFat: true,
    },
  },
  categories: {
    orderBy: { category: { sortOrder: 'asc' as const } },
    select: { category: { select: { slug: true, name: true } } },
  },
} satisfies Prisma.RecipeInclude;

const detailInclude = {
  ...summaryInclude,
  ingredients: {
    orderBy: { position: 'asc' as const },
    select: {
      quantity: true,
      unit: true,
      note: true,
      ingredient: { select: { name: true } },
    },
  },
  steps: {
    orderBy: { position: 'asc' as const },
    select: { position: true, instruction: true },
  },
  videos: {
    where: { isPrimary: true },
    select: {
      youtubeVideoId: true,
      youtubeUrl: true,
      videoTitle: true,
      channelName: true,
    },
  },
} satisfies Prisma.RecipeInclude;

type RecipeWithSummary = Prisma.RecipeGetPayload<{ include: typeof summaryInclude }>;
type RecipeWithDetail = Prisma.RecipeGetPayload<{ include: typeof detailInclude }>;

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapSummary(r: RecipeWithSummary): RecipeSummaryDto {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    imageUrl: r.imageUrl,
    country: r.country,
    difficulty: r.difficulty,
    prepTimeMin: r.prepTimeMin,
    cookTimeMin: r.cookTimeMin,
    totalTimeMin:
      r.prepTimeMin != null && r.cookTimeMin != null
        ? r.prepTimeMin + r.cookTimeMin
        : (r.prepTimeMin ?? r.cookTimeMin ?? null),
    servings: r.servings,
    nutrition: r.nutrition ?? null,
    homePrepCost: r.homePrepCost,
    restaurantPrice: r.restaurantPrice,
    currency: r.currency,
    isPopular: r.isPopular,
    isTrending: r.isTrending,
    isFeatured: r.isFeatured,
    proteinType: r.proteinType,
    dietType: r.dietType,
    tags: r.tags ?? [],
    categories: r.categories.map((c) => c.category),
  };
}

function mapDetail(r: RecipeWithDetail): RecipeDetailDto {
  return {
    ...mapSummary(r),
    description: r.description,
    servingSize: r.servingSize,
    ingredients: r.ingredients.map((i) => ({
      name: i.ingredient.name,
      quantity: i.quantity,
      unit: i.unit,
      note: i.note,
    })),
    steps: r.steps.map((s) => ({ position: s.position, instruction: s.instruction })),
    videos: r.videos.map((v) => ({ ...v })),
  };
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface RecipeListFilters {
  countryCode?: string;
  categoryId?: number;
  categorySlugs?: string[];
  proteinTypes?: ProteinType[];
  dietTypes?: DietType[];
  difficulties?: Difficulty[];
  searchQuery?: string;
  onlyPopular?: boolean;
  onlyTrending?: boolean;
  onlyFeatured?: boolean;
  sort?: RecipeSort;
}

function buildWhere(filters: RecipeListFilters): Prisma.RecipeWhereInput {
  const where: Prisma.RecipeWhereInput = { published: true };

  if (filters.countryCode) {
    where.country = { code: filters.countryCode.toLowerCase() };
  }

  if (filters.categoryId !== undefined) {
    where.categories = { some: { categoryId: filters.categoryId } };
  } else if (filters.categorySlugs && filters.categorySlugs.length > 0) {
    where.categories = { some: { category: { slug: { in: filters.categorySlugs } } } };
  }

  if (filters.proteinTypes && filters.proteinTypes.length > 0) {
    where.proteinType = { in: filters.proteinTypes };
  }
  if (filters.dietTypes && filters.dietTypes.length > 0) {
    where.dietType = { in: filters.dietTypes };
  }
  if (filters.difficulties && filters.difficulties.length > 0) {
    where.difficulty = { in: filters.difficulties };
  }
  if (filters.onlyPopular) where.isPopular = true;
  if (filters.onlyTrending) where.isTrending = true;
  if (filters.onlyFeatured) where.isFeatured = true;

  // Backend-side search across recipe slug/name/description, country, cuisine,
  // category names and canonical ingredient names.
  const q = filters.searchQuery?.trim();
  if (q) {
    const contains = { contains: q, mode: 'insensitive' as const };
    where.OR = [
      { slug: contains },
      { name: contains },
      { description: contains },
      { country: { is: { OR: [{ name: contains }, { cuisineLabel: contains }] } } },
      { categories: { some: { category: { is: { OR: [{ name: contains }, { slug: contains }] } } } } },
      { ingredients: { some: { ingredient: { is: { name: contains } } } } },
      { tags: { has: q } },
    ];
  }

  return where;
}

function buildOrderBy(sort: RecipeSort | undefined): Prisma.RecipeOrderByWithRelationInput[] {
  switch (sort) {
    case 'newest':
      return [{ createdAt: 'desc' }];
    case 'time':
      return [{ prepTimeMin: 'asc' }, { popularityScore: 'desc' }];
    case 'popular':
    default:
      return [{ popularityScore: 'desc' }, { createdAt: 'desc' }];
  }
}

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

export async function listRecipes(
  filters: RecipeListFilters,
  pagination: Pagination
): Promise<PaginatedResult<RecipeSummaryDto>> {
  const where = buildWhere(filters);
  const [rows, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      include: summaryInclude,
      orderBy: buildOrderBy(filters.sort),
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.recipe.count({ where }),
  ]);
  return { items: rows.map(mapSummary), total };
}

export async function getRecipeDetail(idOrSlug: string): Promise<RecipeDetailDto | null> {
  const recipe = await prisma.recipe.findFirst({
    where: {
      published: true,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: detailInclude,
  });
  return recipe ? mapDetail(recipe) : null;
}

export async function listCountries(options: { withCounts?: boolean } = {}) {
  const countries = await prisma.country.findMany({
    orderBy: { name: 'asc' },
    ...(options.withCounts
      ? {
          include: {
            _count: { select: { recipes: { where: { published: true } } } },
          },
        }
      : {}),
  });

  return countries.map((c) => ({
    id: c.id,
    code: c.code,
    slug: c.slug,
    name: c.name,
    region: c.region,
    cuisineLabel: c.cuisineLabel,
    currency: c.currency,
    ...(options.withCounts ? { recipeCount: (c as any)._count.recipes as number } : {}),
  }));
}

export async function getCountryByIdOrCode(idOrCode: string) {
  const numericId = Number.parseInt(idOrCode, 10);
  const country = await prisma.country.findFirst({
    where: Number.isInteger(numericId)
      ? { OR: [{ id: numericId }, { code: idOrCode.toLowerCase() }] }
      : { code: idOrCode.toLowerCase() },
    include: {
      _count: { select: { recipes: { where: { published: true } } } },
    },
  });
  if (!country) return null;
  return {
    id: country.id,
    code: country.code,
    slug: country.slug,
    name: country.name,
    region: country.region,
    cuisineLabel: country.cuisineLabel,
    currency: country.currency,
    recipeCount: country._count.recipes,
  };
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { recipes: true } } },
  }).then((cats) =>
    cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      sortOrder: c.sortOrder,
      recipeCount: c._count.recipes,
    }))
  );
}
