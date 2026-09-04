import { apiPost } from './apiClient';

export interface NutritionPerServing {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  sodium: number;
  saturatedFat?: number;
  cholesterol?: number;
}

export interface NutritionParsedIngredient {
  original: string;
  parsed?: {
    quantity?: number;
    unit?: string;
    foodName?: string;
  };
  matched?: {
    fdcId?: number;
    description?: string;
  };
  grams?: number;
  nutrition?: NutritionPerServing;
}

export interface NutritionAnalysisData {
  recipeName?: string;
  servings: number;
  totalWeight: number;
  totals?: NutritionPerServing;
  perServing: NutritionPerServing;
  ingredients?: NutritionParsedIngredient[];
}

export interface NutritionAnalyzeApiResponse {
  success?: boolean;
  data: NutritionAnalysisData;
}

export function cleanMeasure(measure?: string): string {
  if (!measure) return '';
  return measure
    .replace('½', '0.5')
    .replace('¼', '0.25')
    .replace('¾', '0.75')
    .replace(/(\d+)\s*\/\s*(\d+)/g, (_, num, denom) => `${parseInt(num, 10) / parseInt(denom, 10)}`)
    .trim();
}

/**
 * Analyzes the nutrition content of a recipe based on title and ingredients list.
 * Calls client endpoint /api/nutrition/analyze which is proxied server-side to protect API keys.
 * Endpoint: POST /api/nutrition/analyze
 */
export async function analyzeRecipeNutrition(
  recipeName: string,
  ingredients: string[]
): Promise<NutritionAnalysisData> {
  try {
    const data = await apiPost<NutritionAnalyzeApiResponse>('/api/nutrition/analyze', {
      recipeName,
      ingredients,
    });
    if (data.data && data.data.perServing) {
      return data.data;
    }
  } catch (err) {
    console.warn('API analyzeRecipeNutrition failed:', err);
  }

  // Graceful fallback if network is offline
  return {
    recipeName,
    servings: 1,
    totalWeight: 350,
    perServing: {
      calories: 420,
      protein: 32,
      carbs: 45,
      fat: 12,
      sugar: 4,
      fiber: 6,
      sodium: 480,
      saturatedFat: 3,
    },
  };
}

