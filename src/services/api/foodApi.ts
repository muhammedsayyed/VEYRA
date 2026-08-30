/**
 * Veyra Food API client — production source of truth
 * Neon PostgreSQL → Prisma → foodService → Veyra API → Frontend
 *
 * Endpoints:
 *  GET /api/countries
 *  GET /api/categories
 *  GET /api/recipes?country=eg&category=beef&page=1&limit=20&q=...
 *  GET /api/recipes/search?q=term&country=eg&category=beef
 *  GET /api/recipes/popular?limit=12
 *  GET /api/recipes/:idOrSlug  (detail with ingredients, steps, nutrition, videos)
 */

export interface CountryDto {
  id: number
  code: string
  slug: string
  name: string
  region: string | null
  cuisineLabel: string
  currency: string | null
  recipeCount?: number
}

export interface CategoryDto {
  id: number
  slug: string
  name: string
  description: string | null
}

export interface RecipeVideoDto {
  youtubeVideoId: string
  youtubeUrl: string
  videoTitle: string | null
  channelName: string | null
}

export interface RecipeSummaryDto {
  id: string
  slug: string
  name: string
  imageUrl: string | null
  country: { code: string; name: string; cuisineLabel: string }
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  prepTimeMin: number | null
  cookTimeMin: number | null
  totalTimeMin: number | null
  servings: number
  nutrition: { calories: number; protein: number; carbohydrates: number; fat: number; fiber: number | null; sugar: number | null; sodium: number | null; saturatedFat: number | null } | null
  homePrepCost: number | null
  restaurantPrice: number | null
  currency: string | null
  isPopular: boolean
  isTrending: boolean
  isFeatured: boolean
  proteinType: string | null
  dietType: string | null
  tags: string[]
  categories: Array<{ slug: string; name: string }>
}

export interface RecipeDetailDto extends RecipeSummaryDto {
  description: string | null
  servingSize: string | null
  ingredients: Array<{ name: string; quantity: number | null; unit: string | null; note: string | null }>
  steps: Array<{ position: number; instruction: string }>
  videos: RecipeVideoDto[]
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  pagination?: { total: number; totalPages: number; currentPage: number; limit: number }
  error?: { code: string; message: string }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' })
  const json = (await res.json()) as ApiEnvelope<T>
  if (!res.ok || !json.success) {
    throw new Error((json.error as any)?.message || `Request failed ${res.status}`)
  }
  return json.data
}

async function fetchPaginated<T>(url: string): Promise<{ items: T[]; total: number; totalPages: number; currentPage: number }> {
  const res = await fetch(url, { credentials: 'include' })
  const json = (await res.json()) as ApiEnvelope<T[]> & { pagination?: { total: number; totalPages: number; currentPage: number; limit: number } }
  if (!res.ok || !json.success) {
    throw new Error((json.error as any)?.message || `Request failed ${res.status}`)
  }
  return {
    items: json.data as T[],
    total: json.pagination?.total ?? (json.data as unknown[]).length,
    totalPages: json.pagination?.totalPages ?? 1,
    currentPage: json.pagination?.currentPage ?? 1,
  }
}

export async function fetchCountries(): Promise<CountryDto[]> {
  return fetchJson<CountryDto[]>('/api/countries')
}

export async function fetchCategories(): Promise<CategoryDto[]> {
  return fetchJson<CategoryDto[]>('/api/categories')
}

export interface RecipeListParams {
  country?: string // code like "eg"
  category?: string // slug like "beef"
  q?: string
  page?: number
  limit?: number
  sort?: 'popular' | 'newest' | 'time'
}

export async function fetchRecipes(params: RecipeListParams = {}): Promise<{ items: RecipeSummaryDto[]; total: number; totalPages: number; currentPage: number }> {
  const usp = new URLSearchParams()
  if (params.country) usp.set('country', params.country)
  if (params.category) usp.set('category', params.category)
  if (params.q) usp.set('q', params.q)
  if (params.page) usp.set('page', String(params.page))
  if (params.limit) usp.set('limit', String(params.limit))
  if (params.sort) usp.set('sort', params.sort)
  const qs = usp.toString()
  const url = `/api/recipes${qs ? `?${qs}` : ''}`
  return fetchPaginated<RecipeSummaryDto>(url)
}

export async function searchRecipes(q: string, opts: { country?: string; category?: string; page?: number; limit?: number } = {}): Promise<{ items: RecipeSummaryDto[]; total: number; totalPages: number; currentPage: number }> {
  const usp = new URLSearchParams()
  usp.set('q', q)
  if (opts.country) usp.set('country', opts.country)
  if (opts.category) usp.set('category', opts.category)
  if (opts.page) usp.set('page', String(opts.page))
  if (opts.limit) usp.set('limit', String(opts.limit))
  return fetchPaginated<RecipeSummaryDto>(`/api/recipes/search?${usp.toString()}`)
}

export async function fetchPopularRecipes(limit = 12, country?: string): Promise<RecipeSummaryDto[]> {
  const usp = new URLSearchParams()
  if (country) usp.set('country', country)
  usp.set('limit', String(limit))
  return fetchJson<RecipeSummaryDto[]>(`/api/recipes/popular?${usp.toString()}`)
}

export async function fetchRecipeDetail(idOrSlug: string): Promise<RecipeDetailDto | null> {
  try {
    return await fetchJson<RecipeDetailDto>(`/api/recipes/${encodeURIComponent(idOrSlug)}`)
  } catch {
    // fallback to query param style
    try {
      return await fetchJson<RecipeDetailDto>(`/api/recipes?id=${encodeURIComponent(idOrSlug)}`)
    } catch {
      return null
    }
  }
}

// Legacy FoodItem compatibility mapper (for RecipeDetailsModal)
export function mapDetailToFoodItem(detail: RecipeDetailDto): any {
  const primaryCat = detail.categories.find(c => ['beef','chicken','vegetarian','desserts'].includes(c.slug))?.name || detail.categories[0]?.name || 'Recipe'
  return {
    id: detail.id,
    slug: detail.slug,
    name: detail.name,
    category: primaryCat as any,
    cuisine: detail.country.cuisineLabel,
    country: detail.country.name,
    countryCode: detail.country.code,
    calories: detail.nutrition?.calories ?? 0,
    protein: detail.nutrition?.protein ?? 0,
    carbs: detail.nutrition?.carbohydrates ?? 0,
    fat: detail.nutrition?.fat ?? 0,
    sugar: detail.nutrition?.sugar ?? undefined,
    fiber: detail.nutrition?.fiber ?? undefined,
    sodium: detail.nutrition?.sodium ?? undefined,
    saturatedFat: detail.nutrition?.saturatedFat ?? undefined,
    portionGrams: 320,
    servingSize: detail.servingSize || undefined,
    timeToPrepareMin: detail.totalTimeMin ?? undefined,
    prepTimeMin: detail.prepTimeMin ?? undefined,
    cookTimeMin: detail.cookTimeMin ?? undefined,
    difficulty: detail.difficulty,
    score: detail.isPopular ? 9.2 : 8.5,
    ingredients: detail.ingredients.map(i => `${i.quantity ?? ''} ${i.unit ?? ''} ${i.name}`.trim()),
    ingredientsDetailed: detail.ingredients,
    recipeSteps: detail.steps.map(s => s.instruction),
    steps: detail.steps,
    homePrepCost: detail.homePrepCost ?? undefined,
    restaurantPrice: detail.restaurantPrice ?? undefined,
    currency: detail.currency || undefined,
    youtubeUrl: detail.videos?.[0]?.youtubeUrl || undefined,
    videos: detail.videos || [],
    img: detail.imageUrl || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&auto=format',
    tags: detail.tags,
    categories: detail.categories,
    isPopular: detail.isPopular,
    isTrending: detail.isTrending,
    isFeatured: detail.isFeatured,
    proteinType: detail.proteinType,
    dietType: detail.dietType,
    nutrition: detail.nutrition,
    description: detail.description,
  }
}

export function mapSummaryToFoodItem(summary: RecipeSummaryDto): any {
  const primaryCat = summary.categories.find(c => ['beef','chicken','vegetarian','desserts'].includes(c.slug))?.name || summary.categories[0]?.name || 'Recipe'
  return {
    id: summary.id,
    slug: summary.slug,
    name: summary.name,
    category: primaryCat as any,
    cuisine: summary.country.cuisineLabel,
    country: summary.country.name,
    countryCode: summary.country.code,
    calories: summary.nutrition?.calories ?? 0,
    protein: summary.nutrition?.protein ?? 0,
    carbs: summary.nutrition?.carbohydrates ?? 0,
    fat: summary.nutrition?.fat ?? 0,
    portionGrams: 320,
    servingSize: undefined,
    timeToPrepareMin: summary.totalTimeMin ?? undefined,
    difficulty: summary.difficulty,
    score: summary.isPopular ? 9.2 : 8.5,
    ingredients: [],
    homePrepCost: summary.homePrepCost ?? undefined,
    restaurantPrice: summary.restaurantPrice ?? undefined,
    currency: summary.currency || undefined,
    img: summary.imageUrl || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&auto=format',
    tags: summary.tags,
    categories: summary.categories,
    isPopular: summary.isPopular,
    proteinType: summary.proteinType,
  }
}
