import { dbStore } from './dbStore';
import { hashPassword, verifyPassword, generateSessionToken, verifySessionToken } from './authCrypto';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server-side session verification.
 * Extracts session token from cookie or Authorization header and looks up authenticated user in DB.
 */
export async function authenticateRequest(headers: Record<string, string>): Promise<string | null> {
  const cookieHeader = headers['cookie'] || headers['Cookie'] || '';
  let token = '';

  const cookieMatch = cookieHeader.match(/veyra_session=([^;]+)/);
  if (cookieMatch) {
    token = cookieMatch[1].trim();
  }

  if (!token) {
    const authHeader = headers['authorization'] || headers['Authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) return null;

  return await verifySessionToken(token);
}

/**
 * Universal Unified Backend API Router
 * Handles all production backend requests for Web, Mobile, and Edge Serverless functions.
 */
export class VeyraApiRouter {
  // Auth Registration
  static async handleSignup(body: any): Promise<{ response: ApiResponse; cookieHeader?: string }> {
    try {
      const { firstName, lastName, email, password, goal } = body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail || !cleanPassword || !firstName) {
        return { response: { success: false, error: 'First name, email, and password are required.' } };
      }

      // Check existing user first
      const existing = await dbStore.getUserByEmail(cleanEmail);
      if (existing) {
        return { response: { success: false, error: 'An account with this email already exists.' } };
      }

      const passwordHashData = await hashPassword(cleanPassword);
      const passwordHash = `${passwordHashData.saltHex}:${passwordHashData.hashHex}`;

      const user = await dbStore.createUser({
        firstName: firstName.trim(),
        lastName: (lastName || '').trim(),
        email: cleanEmail,
        passwordHash,
        wellnessGoal: goal || 'Improve Fitness',
        age: 28,
        height: 175,
        weight: 70,
        targetWeight: 70,
        activityLevel: 'moderate',
        dietaryPreferences: [],
        allergens: [],
        favoriteFoods: [],
      });

      const sessionToken = await generateSessionToken(user.id);
      const cookieHeader = `veyra_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;

      return {
        response: {
          success: true,
          data: {
            token: sessionToken,
            user,
          },
        },
        cookieHeader,
      };
    } catch (err: any) {
      console.error('Signup Error:', err);
      const msg = err?.message || 'Registration failed.';
      const isDuplicate = msg.includes('already exists') || msg.includes('unique constraint') || msg.includes('duplicate key');
      return { response: { success: false, error: isDuplicate ? 'An account with this email already exists.' : msg } };
    }
  }

  // Auth Login
  static async handleLogin(body: any): Promise<{ response: ApiResponse; cookieHeader?: string }> {
    try {
      const { email, password } = body;
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !password) {
        return { response: { success: false, error: 'Email and password are required.' } };
      }

      const user = await dbStore.getUserByEmail(cleanEmail);
      if (!user) {
        return { response: { success: false, error: 'Invalid email or password.' } };
      }

      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return { response: { success: false, error: 'Invalid email or password.' } };
      }

      const sessionToken = await generateSessionToken(user.id);
      const cookieHeader = `veyra_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;

      return {
        response: {
          success: true,
          data: {
            token: sessionToken,
            user,
          },
        },
        cookieHeader,
      };
    } catch (err: any) {
      console.error('Login Error:', err);
      return { response: { success: false, error: err.message || 'Login failed.' } };
    }
  }

  // Auth Me
  static async handleAuthMe(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const user = await dbStore.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };
    return { success: true, data: user };
  }

  // Profile Endpoints
  static async getProfile(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const user = await dbStore.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };
    return { success: true, data: user };
  }

  static async handleGetProfile(userId: string | null): Promise<ApiResponse> {
    return this.getProfile(userId);
  }

  static async updateProfile(userId: string | null, updates: any): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const updated = await dbStore.updateUser(userId, updates);
    return { success: true, data: updated };
  }

  static async handleUpdateProfile(userId: string | null, updates: any): Promise<ApiResponse> {
    return this.updateProfile(userId, updates);
  }

  // Food Log Endpoints
  static async getFoodLog(userId: string | null, date?: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const logs = await dbStore.getFoodLogs(userId, date);
    return { success: true, data: logs };
  }

  static async handleGetFoodLogs(userId: string | null, date?: string): Promise<ApiResponse> {
    return this.getFoodLog(userId, date);
  }

  static async addFoodLog(userId: string | null, logData: any): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const log = await dbStore.addFoodLog(userId, logData);
    return { success: true, data: log };
  }

  static async handleAddFoodLog(userId: string | null, logData: any): Promise<ApiResponse> {
    return this.addFoodLog(userId, logData);
  }

  static async deleteFoodLog(userId: string | null, logId: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    await dbStore.deleteFoodLog(logId, userId);
    return { success: true, data: { message: 'Food log deleted successfully' } };
  }

  static async handleDeleteFoodLog(userId: string | null, logId: string): Promise<ApiResponse> {
    return this.deleteFoodLog(userId, logId);
  }

  // Daily Nutrition Totals
  static async getDailyNutrition(userId: string | null, date: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const daily = await dbStore.getDailyNutrition(userId, date);
    return { success: true, data: daily };
  }

  static async handleGetDailyNutrition(userId: string | null, date: string): Promise<ApiResponse> {
    return this.getDailyNutrition(userId, date);
  }

  // Scan History Endpoints
  static async getScans(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const scans = await dbStore.getScanHistory(userId);
    return { success: true, data: scans };
  }

  static async handleGetScans(userId: string | null): Promise<ApiResponse> {
    return this.getScans(userId);
  }

  static async addScan(userId: string | null, scanData: any): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const scan = await dbStore.addScanHistory(userId, scanData);
    return { success: true, data: scan };
  }

  static async handleAddScan(userId: string | null, scanData: any): Promise<ApiResponse> {
    return this.addScan(userId, scanData);
  }

  // Workout History Endpoints
  static async getWorkouts(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const workouts = await dbStore.getWorkoutHistory(userId);
    return { success: true, data: workouts };
  }

  static async handleGetWorkouts(userId: string | null): Promise<ApiResponse> {
    return this.getWorkouts(userId);
  }

  static async addWorkout(userId: string | null, workoutData: any): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const workout = await dbStore.addWorkoutHistory(userId, workoutData);
    return { success: true, data: workout };
  }

  static async handleAddWorkout(userId: string | null, workoutData: any): Promise<ApiResponse> {
    return this.addWorkout(userId, workoutData);
  }

  // Water Endpoint
  static async updateWater(userId: string | null, date: string, waterConsumed: number): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const updated = await dbStore.updateWater(userId, date, waterConsumed);
    return { success: true, data: updated };
  }

  // Pantry Endpoints
  static async getPantryItems(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const items = await dbStore.getPantryItems(userId);
    return { success: true, data: items };
  }

  static async addPantryItem(userId: string | null, data: any): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const item = await dbStore.addPantryItem(userId, data);
    return { success: true, data: item };
  }

  static async updatePantryItem(userId: string | null, itemId: string, updates: any): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const item = await dbStore.updatePantryItem(userId, itemId, updates);
    return { success: true, data: item };
  }

  static async deletePantryItem(userId: string | null, itemId: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const res = await dbStore.deletePantryItem(userId, itemId);
    return { success: res };
  }

  // Shopping List Endpoints
  static async getShoppingList(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const list = await dbStore.getShoppingList(userId);
    return { success: true, data: list };
  }

  static async addShoppingListItem(userId: string | null, data: any): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const item = await dbStore.addShoppingListItem(userId, data);
    return { success: true, data: item };
  }

  static async addBatchShoppingList(userId: string | null, items: any[]): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const res = await dbStore.addBatchShoppingList(userId, items);
    return { success: true, data: res };
  }

  static async updateShoppingListItem(userId: string | null, itemId: string, updates: any): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const item = await dbStore.updateShoppingListItem(userId, itemId, updates);
    return { success: true, data: item };
  }

  static async deleteShoppingListItem(userId: string | null, itemId: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const res = await dbStore.deleteShoppingListItem(userId, itemId);
    return { success: res };
  }

  static async clearPurchasedShoppingList(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const res = await dbStore.clearPurchasedShoppingList(userId);
    return { success: res };
  }

  static async clearEntireShoppingList(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const res = await dbStore.clearEntireShoppingList(userId);
    return { success: res };
  }

  // Meal Plan Endpoints
  static async getMealPlan(userId: string | null, weekStartDate: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const plan = await dbStore.getMealPlan(userId, weekStartDate);
    return { success: true, data: plan };
  }

  static async saveMealPlan(userId: string | null, weekStartDate: string, mealsJson: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const plan = await dbStore.saveMealPlan(userId, weekStartDate, mealsJson);
    return { success: true, data: plan };
  }

  // Weight History Endpoints
  static async getWeightHistory(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const history = await dbStore.getWeightHistory(userId);
    return { success: true, data: history };
  }

  static async addWeightEntry(userId: string | null, weight: number, date?: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const entry = await dbStore.addWeightEntry(userId, weight, date);
    return { success: true, data: entry };
  }

  // Favorites Endpoints
  static async getFavorites(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const favorites = await dbStore.getFavorites(userId);
    return { success: true, data: favorites };
  }

  static async addFavorite(userId: string | null, recipe: any): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const fav = await dbStore.addFavorite(userId, recipe);
    return { success: true, data: fav };
  }

  static async removeFavorite(userId: string | null, recipeId: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const res = await dbStore.removeFavorite(userId, recipeId);
    return { success: res };
  }

  // Recipe Reviews Endpoints
  static async getRecipeReviews(recipeId: string): Promise<ApiResponse> {
    const reviews = await dbStore.getRecipeReviews(recipeId);
    return { success: true, data: reviews };
  }

  static async addRecipeReview(userId: string | null, recipeId: string, rating: number, text: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const rev = await dbStore.addRecipeReview(userId, recipeId, rating, text);
    return { success: true, data: rev };
  }

  static async updateRecipeReview(userId: string | null, reviewId: string, rating: number, text: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const rev = await dbStore.updateRecipeReview(userId, reviewId, rating, text);
    return { success: true, data: rev };
  }

  static async deleteRecipeReview(userId: string | null, reviewId: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const res = await dbStore.deleteRecipeReview(userId, reviewId);
    return { success: res };
  }

  // Smart Notifications Endpoints
  static async getNotifications(userId: string | null): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const notifs = await dbStore.getNotifications(userId);
    return { success: true, data: notifs };
  }

  static async addNotification(userId: string | null, data: { title: string; message: string; category: string }): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const notif = await dbStore.addNotification(userId, data);
    return { success: true, data: notif };
  }

  static async markNotificationAsRead(userId: string | null, notificationId: string): Promise<ApiResponse> {
    if (!userId) return { success: false, error: 'Unauthorized' };
    const res = await dbStore.markNotificationAsRead(userId, notificationId);
    return { success: res };
  }
}

