import { Product, ProductNutrition, ProductMicronutrients } from '@/types';
import { normalizeBarcode, isValidBarcodeFormat } from '@/utils/barcodeNormalizer';
import { getRobotoffInsights } from './robotoffService';
import { fetchWithTimeout } from './apiClient';

// Short-lived in-memory cache for barcode queries to avoid repetitive network requests
const barcodeCache = new Map<string, { product: Product; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export type NutriScoreGrade = 'a' | 'b' | 'c' | 'd' | 'e' | 'unknown';
export type NovaGroup = 1 | 2 | 3 | 4 | 'unknown';

export interface ApiProduct {
  barcode: string;
  name: string;
  genericName?: string;
  brand: string;
  image: string;
  frontImageUrl?: string;
  servingSize?: string;
  nutritionGrade: NutriScoreGrade;
  novaGroup: NovaGroup;
  nutrients: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
    saturatedFat?: number;
    fiber?: number;
    sodium?: number;
    salt?: number;
  };
  micronutrients?: ProductMicronutrients;
  ingredients?: string;
  allergens?: string;
  categories?: string[];
  countries?: string[];
  labels?: string[];
  robotoffInsights?: any[];
  rawProduct?: Product;
}

export interface ProductPagination {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

/**
 * Helper to safely extract clean strings or join string arrays from Open Food Facts API
 */
function cleanTags(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((t) => t.replace(/^[a-z]{2}:/i, '').replace(/[-_]/g, ' ').trim()).filter(Boolean);
  }
  return input
    .split(',')
    .map((t) => t.replace(/^[a-z]{2}:/i, '').replace(/[-_]/g, ' ').trim())
    .filter(Boolean);
}

/**
 * Maps Open Food Facts product payload into normalized Product type
 */
export function mapOffToProduct(raw: any, barcode: string): Product {
  const nutriments = raw.nutriments || {};

  // Extract calories: prefer energy-kcal_100g, energy-kcal, energy-kcal_serving, or calculate from energy kJ
  let calories: number | undefined = undefined;
  if (typeof nutriments['energy-kcal_100g'] === 'number') calories = nutriments['energy-kcal_100g'];
  else if (typeof nutriments['energy-kcal'] === 'number') calories = nutriments['energy-kcal'];
  else if (typeof nutriments['energy-kcal_serving'] === 'number') calories = nutriments['energy-kcal_serving'];
  else if (typeof nutriments['energy_100g'] === 'number') calories = Math.round(nutriments['energy_100g'] / 4.184);

  const getNum = (key1: string, key2?: string): number | undefined => {
    if (typeof nutriments[key1] === 'number') return Number(nutriments[key1]);
    if (key2 && typeof nutriments[key2] === 'number') return Number(nutriments[key2]);
    return undefined;
  };

  const protein = getNum('proteins_100g', 'proteins');
  const carbohydrates = getNum('carbohydrates_100g', 'carbohydrates');
  const sugars = getNum('sugars_100g', 'sugars');
  const fat = getNum('fat_100g', 'fat');
  const saturatedFat = getNum('saturated-fat_100g', 'saturated-fat');
  const fiber = getNum('fiber_100g', 'fiber');
  const sodium = getNum('sodium_100g', 'sodium');
  let salt = getNum('salt_100g', 'salt');
  if (salt === undefined && sodium !== undefined) {
    salt = Number((sodium * 2.5).toFixed(2));
  }

  const nutrition: ProductNutrition = {
    calories: calories !== undefined ? Math.round(calories) : undefined,
    protein: protein !== undefined ? Number(protein.toFixed(1)) : undefined,
    carbohydrates: carbohydrates !== undefined ? Number(carbohydrates.toFixed(1)) : undefined,
    sugars: sugars !== undefined ? Number(sugars.toFixed(1)) : undefined,
    fat: fat !== undefined ? Number(fat.toFixed(1)) : undefined,
    saturatedFat: saturatedFat !== undefined ? Number(saturatedFat.toFixed(1)) : undefined,
    fiber: fiber !== undefined ? Number(fiber.toFixed(1)) : undefined,
    sodium: sodium !== undefined ? Number(sodium.toFixed(3)) : undefined,
    salt: salt !== undefined ? Number(salt.toFixed(2)) : undefined,
  };

  const micronutrients: ProductMicronutrients = {
    calcium: getNum('calcium_100g', 'calcium'),
    iron: getNum('iron_100g', 'iron'),
    magnesium: getNum('magnesium_100g', 'magnesium'),
    potassium: getNum('potassium_100g', 'potassium'),
    zinc: getNum('zinc_100g', 'zinc'),
    vitaminA: getNum('vitamin-a_100g', 'vitamin-a'),
    vitaminC: getNum('vitamin-c_100g', 'vitamin-c'),
    vitaminD: getNum('vitamin-d_100g', 'vitamin-d'),
    vitaminB12: getNum('vitamin-b12_100g', 'vitamin-b12'),
    folate: getNum('vitamin-b9_100g', 'folates_100g'),
  };

  // Clean empty micronutrients
  Object.keys(micronutrients).forEach((k) => {
    if (micronutrients[k] === undefined) delete micronutrients[k];
  });

  const ingredientsText = raw.ingredients_text || raw.ingredients_text_en || raw.ingredients_text_fr || '';
  const ingredients = ingredientsText
    ? ingredientsText.split(/[,;\n]/).map((i: string) => i.trim()).filter(Boolean)
    : [];

  const name =
    raw.product_name ||
    raw.product_name_en ||
    raw.product_name_fr ||
    raw.abbreviated_product_name ||
    'Food Product';

  const brand = raw.brands || raw.brand_owner || 'Verified Brand';
  const genericName = raw.generic_name || raw.generic_name_en || undefined;
  const imageUrl = raw.image_front_url || raw.image_url || raw.image_front_small_url || undefined;
  const frontImageUrl = raw.image_front_url || raw.image_url || undefined;
  const servingSize = raw.serving_size || undefined;

  const nutriScoreRaw = (raw.nutriscore_grade || raw.nutrition_grades || '').toUpperCase();
  const nutriScore = ['A', 'B', 'C', 'D', 'E'].includes(nutriScoreRaw) ? (nutriScoreRaw as any) : undefined;
  const novaGroup = [1, 2, 3, 4].includes(raw.nova_group) ? raw.nova_group : undefined;

  return {
    barcode,
    name,
    genericName,
    brand,
    imageUrl,
    frontImageUrl,
    servingSize,
    nutrition,
    micronutrients: Object.keys(micronutrients).length > 0 ? micronutrients : undefined,
    ingredients: ingredients.length > 0 ? ingredients : undefined,
    allergens: cleanTags(raw.allergens_tags || raw.allergens),
    categories: cleanTags(raw.categories_tags || raw.categories),
    countries: cleanTags(raw.countries_tags || raw.countries),
    nutriScore,
    novaGroup,
    labels: cleanTags(raw.labels_tags || raw.labels),
  };
}

/**
 * Converts a Product to ApiProduct interface for backwards compatibility
 */
export function mapProductToApiProduct(prod: Product): ApiProduct {
  return {
    barcode: prod.barcode,
    name: prod.name,
    genericName: prod.genericName,
    brand: prod.brand || 'Verified Brand',
    image: prod.imageUrl || '',
    frontImageUrl: prod.frontImageUrl,
    servingSize: prod.servingSize,
    nutritionGrade: (prod.nutriScore?.toLowerCase() as any) || 'unknown',
    novaGroup: prod.novaGroup || 'unknown',
    nutrients: {
      calories: prod.nutrition.calories,
      protein: prod.nutrition.protein,
      carbs: prod.nutrition.carbohydrates,
      fat: prod.nutrition.fat,
      sugar: prod.nutrition.sugars,
      saturatedFat: prod.nutrition.saturatedFat,
      fiber: prod.nutrition.fiber,
      sodium: prod.nutrition.sodium,
      salt: prod.nutrition.salt,
    },
    micronutrients: prod.micronutrients,
    ingredients: prod.ingredients?.join(', '),
    allergens: prod.allergens?.join(', '),
    categories: prod.categories,
    countries: prod.countries,
    labels: prod.labels,
    robotoffInsights: prod.robotoffInsights,
    rawProduct: prod,
  };
}

/**
 * Open Food Facts Barcode Lookup (Layer 1) + Optional Robotoff Enrichment (Layer 2) + Exact Barcode Verification
 * Endpoint: GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json
 */
export async function getProductByBarcode(rawBarcode: string): Promise<ApiProduct> {
  const barcode = normalizeBarcode(rawBarcode);

  if (!barcode || !isValidBarcodeFormat(barcode)) {
    throw new Error('Invalid barcode format. Please scan a valid numeric product barcode.');
  }

  // 1. Check in-memory cache
  const cached = barcodeCache.get(barcode);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return mapProductToApiProduct(cached.product);
  }

  // 2. Query Open Food Facts API v2
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

  let response: Response;
  try {
    response = await fetchWithTimeout(url, { timeoutMs: 8000 });
  } catch (err: any) {
    if (err?.isNetworkError) {
      throw new Error('Unable to connect to the global product database. Please check your internet connection.');
    }
    throw new Error('Product request timed out. Please try scanning again.');
  }

  if (response.status === 404) {
    throw new Error(`Product with barcode "${barcode}" was not found in the global database.`);
  }

  if (response.status === 429) {
    throw new Error('Too many requests. Please try scanning again in a moment.');
  }

  if (!response.ok) {
    throw new Error(`Product database returned status ${response.status}. Please try again.`);
  }

  const data = await response.json();

  if (!data || data.status === 0 || !data.product) {
    throw new Error(`Product with barcode "${barcode}" was not found in the global database.`);
  }

  // 3. Exact Barcode Verification
  const returnedCode = normalizeBarcode(String(data.code || data.product.code || data.product._id || ''));
  if (returnedCode && returnedCode !== barcode) {
    throw new Error(`Product verification failed: Returned barcode "${returnedCode}" does not match scanned barcode "${barcode}".`);
  }

  // 4. Map Open Food Facts data
  const product = mapOffToProduct(data.product, barcode);

  // 5. Query Layer 2: Optional Robotoff Enrichment (Non-blocking)
  try {
    const robotoffInsights = await getRobotoffInsights(barcode);
    if (robotoffInsights && robotoffInsights.length > 0) {
      product.robotoffInsights = robotoffInsights;
    }
  } catch (err) {
    // Non-blocking
  }

  // Cache verified result
  barcodeCache.set(barcode, { product, timestamp: Date.now() });

  return mapProductToApiProduct(product);
}

/**
 * Searches food products by keyword query via Open Food Facts Search API.
 * Endpoint: GET https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size={limit}
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  limit: number = 24
): Promise<{ products: ApiProduct[]; pagination?: ProductPagination }> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return { products: [] };

  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    cleanQuery
  )}&search_simple=1&action=process&json=1&page=${page}&page_size=${limit}`;

  try {
    const response = await fetchWithTimeout(url, { timeoutMs: 10000 });
    if (!response.ok) {
      return { products: [] };
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.products)) {
      return { products: [] };
    }

    const products: ApiProduct[] = data.products
      .filter((p: any) => p && (p.product_name || p.product_name_en))
      .map((p: any) => {
        const bCode = normalizeBarcode(String(p.code || p._id || ''));
        const mapped = mapOffToProduct(p, bCode);
        return mapProductToApiProduct(mapped);
      });

    const total = data.count || products.length;
    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  } catch (err) {
    console.warn('Open Food Facts search failed:', err);
    return { products: [] };
  }
}

/**
 * Fetches product categories list from Open Food Facts categories.
 */
export async function getProductCategories(): Promise<{ id: string; name: string }[]> {
  try {
    const url = 'https://world.openfoodfacts.org/categories.json';
    const res = await fetchWithTimeout(url, { timeoutMs: 5000 });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.tags)) return [];

    return data.tags.slice(0, 30).map((cat: any) => ({
      id: cat.id || cat.name,
      name: cat.name || cat.id,
    }));
  } catch (err) {
    console.warn('getProductCategories error:', err);
    return [];
  }
}

/**
 * Filters food products by category.
 */
export async function getProductsByCategory(
  categoryName: string,
  page: number = 1,
  limit: number = 24
): Promise<ApiProduct[]> {
  try {
    const cleanCat = categoryName.trim().toLowerCase().replace(/\s+/g, '-');
    const url = `https://world.openfoodfacts.org/category/${encodeURIComponent(cleanCat)}.json?page=${page}&page_size=${limit}`;
    const res = await fetchWithTimeout(url, { timeoutMs: 8000 });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.products)) return [];

    return data.products.map((p: any) => {
      const bCode = normalizeBarcode(String(p.code || p._id || ''));
      return mapProductToApiProduct(mapOffToProduct(p, bCode));
    });
  } catch (err) {
    console.warn('getProductsByCategory error:', err);
    return [];
  }
}
