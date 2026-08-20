import { apiGet } from './apiClient';

export interface IngredientItem {
  ingredient: string;
  measure: string;
}

export interface ApiMeal {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string[];
  thumbnail: string;
  tags?: string[];
  youtube?: string;
  source?: string;
  ingredients: IngredientItem[];
}

export interface CategoryItem {
  id?: string;
  name: string;
  thumbnail?: string;
  description?: string;
}

export interface AreaItem {
  name: string;
}

export interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface CategoriesApiResponse {
  message?: string;
  results: CategoryItem[];
}

export interface AreasApiResponse {
  message?: string;
  results: AreaItem[];
}

export interface MealsFilterApiResponse {
  message?: string;
  pagination?: PaginationInfo;
  results: ApiMeal[];
}

export interface MealDetailApiResponse {
  message?: string;
  result: ApiMeal;
}

export interface MealSearchApiResponse {
  message?: string;
  pagination?: PaginationInfo;
  results: ApiMeal[];
}

/**
 * Fetches all available recipe categories.
 * Endpoint: GET /meals/categories
 */
export async function getMealCategories(): Promise<CategoryItem[]> {
  try {
    const data = await apiGet<CategoriesApiResponse>('/meals/categories');
    return data.results || [];
  } catch (err) {
    console.warn('API getMealCategories failed:', err);
    return [];
  }
}

/**
 * Fetches all available recipe areas/cuisines.
 * Endpoint: GET /meals/areas
 */
export async function getMealAreas(): Promise<AreaItem[]> {
  try {
    const data = await apiGet<AreasApiResponse>('/meals/areas');
    return data.results || [];
  } catch (err) {
    console.warn('API getMealAreas failed:', err);
    return [];
  }
}

/**
 * Fetches random meals from the NutriPlan API.
 * Endpoint: GET /meals/random?count={count}
 */
export async function getRandomMeals(count: number = 10): Promise<ApiMeal[]> {
  try {
    const data = await apiGet<MealsFilterApiResponse>('/meals/random', { count });
    return data.results || [];
  } catch (err) {
    console.warn('API getRandomMeals failed:', err);
    return [];
  }
}

/**
 * Filters meals by category and/or area with optional limit.
 * Note: If neither category nor area is specified, NutriPlan /meals/filter throws an error.
 * Therefore, if both are empty, we fetch via searchMeals('') or getRandomMeals(limit).
 * Endpoint: GET /meals/filter?category={cat}&area={area}&limit={limit}
 */
export async function filterMeals(
  category: string = '',
  area: string = '',
  limit: number = 20
): Promise<ApiMeal[]> {
  try {
    const catClean = category && category !== 'All' ? category.trim() : '';
    const areaClean = area && area !== 'All' ? area.trim() : '';

    if (!catClean && !areaClean) {
      // NutriPlan backend requires at least one filter param on /meals/filter.
      // Use searchMeals or random meals for empty filters.
      const searchRes = await searchMeals('');
      if (searchRes && searchRes.length > 0) return searchRes;
      return getRandomMeals(limit);
    }

    const data = await apiGet<MealsFilterApiResponse>('/meals/filter', {
      category: catClean || undefined,
      area: areaClean || undefined,
      limit,
    });

    return data.results || [];
  } catch (err) {
    console.warn('API filterMeals failed:', err);
    throw err;
  }
}

/**
 * Searches meals by term/query.
 * Endpoint: GET /meals/search?q={term}
 */
export async function searchMeals(term: string = ''): Promise<ApiMeal[]> {
  try {
    const data = await apiGet<MealSearchApiResponse>('/meals/search', {
      q: term.trim().toLowerCase(),
    });
    return data.results || [];
  } catch (err) {
    console.warn('API searchMeals failed:', err);
    throw err;
  }
}

/**
 * Fetches a single meal's complete details by its ID.
 * Endpoint: GET /meals/{mealID}
 */
export async function getMealById(mealId: string): Promise<ApiMeal> {
  const data = await apiGet<MealDetailApiResponse>(`/meals/${mealId.trim()}`);
  if (!data.result) {
    throw new Error(`Meal with ID "${mealId}" was not found.`);
  }
  return data.result;
}

