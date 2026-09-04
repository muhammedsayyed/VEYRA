import handleCategories from '../src/services/api-handlers/categories';
import handleCountries from '../src/services/api-handlers/countries';
import handleRecipes from '../src/services/api-handlers/recipes';
import handleRecipesPopular from '../src/services/api-handlers/recipesPopular';
import handleRecipesSearch from '../src/services/api-handlers/recipesSearch';
import handleRecipeDetail from '../src/services/api-handlers/recipesDetail';
import handleAiChat from '../src/services/api-handlers/aiChat';
import handleAuthLogin from '../src/services/api-handlers/authLogin';
import handleAuthLogout from '../src/services/api-handlers/authLogout';
import handleAuthMe from '../src/services/api-handlers/authMe';
import handleAuthSignup from '../src/services/api-handlers/authSignup';
import handleFavorites from '../src/services/api-handlers/favorites';
import handleMealPlan from '../src/services/api-handlers/mealPlan';
import handleNotifications from '../src/services/api-handlers/notifications';
import handlePantry from '../src/services/api-handlers/pantry';
import handleReviews from '../src/services/api-handlers/reviews';
import handleShoppingList from '../src/services/api-handlers/shoppingList';
import handleWater from '../src/services/api-handlers/water';
import handleWeightHistory from '../src/services/api-handlers/weightHistory';
import handleWorkouts from '../src/services/api-handlers/workouts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  let path = url.searchParams.get('path');
  if (!path) {
    path = url.pathname.replace(/^\/api\/?/, '');
  }
  path = (path || '').replace(/^\/+|\/+$/g, '');

  try {
    if (path === 'ai/chat') return await handleAiChat(req);
    if (path === 'auth/login') return await handleAuthLogin(req);
    if (path === 'auth/logout') return await handleAuthLogout();
    if (path === 'auth/me') return await handleAuthMe(req);
    if (path === 'auth/signup') return await handleAuthSignup(req);
    if (path === 'categories') return await handleCategories(req);
    if (path === 'countries') return await handleCountries(req);
    if (path === 'favorites') return await handleFavorites(req);
    if (path === 'meal-plan') return await handleMealPlan(req);
    if (path === 'notifications') return await handleNotifications(req);
    if (path === 'pantry') return await handlePantry(req);
    if (path === 'recipes/popular') return await handleRecipesPopular(req);
    if (path === 'recipes/search') return await handleRecipesSearch(req);
    if (path.startsWith('recipes/')) {
      const id = path.slice('recipes/'.length);
      return await handleRecipeDetail(req, id);
    }
    if (path === 'recipes') return await handleRecipes(req);
    if (path === 'reviews') return await handleReviews(req);
    if (path === 'shopping-list') return await handleShoppingList(req);
    if (path === 'water') return await handleWater(req);
    if (path === 'weight-history') return await handleWeightHistory(req);
    if (path === 'workouts') return await handleWorkouts(req);

    if (path === '' || path === 'health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'veyra-unified-api' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    return new Response(JSON.stringify({ error: `Not Found: /api/${path}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (error: any) {
    console.error(`API Route Error for /api/${path}:`, error);
    return new Response(JSON.stringify({ error: error?.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
