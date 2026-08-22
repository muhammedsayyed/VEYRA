import { UserProfile, LoggedMealEntry, FoodItem, WorkoutRoutine } from '../../types';
import { VeyraApiRouter } from '../backend/apiRouter';

/**
 * Reusable Production API Client for Web and Mobile Veyra Applications
 * Encapsulates authentication headers, user isolation, and shared backend API endpoints.
 */
export class VeyraApiClient {
  private static authToken: string | null = null;
  private static activeUserId: string | null = null;

  static setSession(token: string, userId: string) {
    VeyraApiClient.authToken = token;
    VeyraApiClient.activeUserId = userId;
  }

  static getActiveUserId(): string {
    return VeyraApiClient.activeUserId || 'usr_default_veyra_member';
  }

  // Auth APIs
  static async login(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; token?: string; error?: string }> {
    try {
      // In browser environment, send HTTP request to backend endpoint
      if (typeof window !== 'undefined') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          const u = data.data.user;
          VeyraApiClient.setSession(data.data.token, u.id);
          return {
            success: true,
            token: data.data.token,
            user: {
              name: `${u.firstName} ${u.lastName}`.trim(),
              email: u.email,
              age: u.age,
              heightCm: u.height,
              weightKg: u.weight,
              targetWeightKg: u.targetWeight,
              goal: u.wellnessGoal as any,
              activityLevel: u.activityLevel as any,
              dailyCalories: u.wellnessGoal === 'Lose Weight' ? 1900 : 2300,
              dailyProtein: Math.round(u.weight * 1.8),
              dailyCarbs: 240,
              dailyFat: 70,
              dailyWater: 2.5,
              dietaryPreferences: u.dietaryPreferences || [],
              favoriteCuisines: u.favoriteFoods || [],
              allergens: u.allergens || [],
              units: 'metric',
              theme: 'light',
              notifications: {
                aiInsights: true,
                mealReminders: true,
                workoutReminders: true,
                hydrationReminders: true,
                weeklyReport: true,
              },
              aiProactiveFrequency: 'high',
            },
          };
        }
        return { success: false, error: data.error || 'Invalid email or password.' };
      }

      // Node / SSR mode fallback
      const direct = await VeyraApiRouter.handleLogin({ email, password });
      if (direct.response.success && direct.response.data) {
        const u = direct.response.data.user;
        VeyraApiClient.setSession(direct.response.data.token, u.id);
        return {
          success: true,
          token: direct.response.data.token,
          user: {
            name: `${u.firstName} ${u.lastName}`.trim(),
            email: u.email,
            age: u.age,
            heightCm: u.height,
            weightKg: u.weight,
            targetWeightKg: u.targetWeight,
            goal: u.wellnessGoal as any,
            activityLevel: u.activityLevel as any,
            dailyCalories: u.wellnessGoal === 'Lose Weight' ? 1900 : 2300,
            dailyProtein: Math.round(u.weight * 1.8),
            dailyCarbs: 240,
            dailyFat: 70,
            dailyWater: 2.5,
            dietaryPreferences: u.dietaryPreferences || [],
            favoriteCuisines: u.favoriteFoods || [],
            allergens: u.allergens || [],
            units: 'metric',
            theme: 'light',
            notifications: {
              aiInsights: true,
              mealReminders: true,
              workoutReminders: true,
              hydrationReminders: true,
              weeklyReport: true,
            },
            aiProactiveFrequency: 'high',
          },
        };
      }
      return { success: false, error: direct.response.error || 'Invalid email or password.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  }

  static async signup(data: { firstName: string; lastName: string; email: string; password: string; goal: string }): Promise<{ success: boolean; user?: UserProfile; token?: string; error?: string }> {
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        const resData = await res.json();
        if (res.ok && resData.success && resData.data) {
          const u = resData.data.user;
          VeyraApiClient.setSession(resData.data.token, u.id);
          return {
            success: true,
            token: resData.data.token,
            user: {
              name: `${u.firstName} ${u.lastName}`.trim(),
              email: u.email,
              age: u.age,
              heightCm: u.height,
              weightKg: u.weight,
              targetWeightKg: u.targetWeight,
              goal: u.wellnessGoal as any,
              activityLevel: u.activityLevel as any,
              dailyCalories: u.wellnessGoal === 'Lose Weight' ? 1900 : 2300,
              dailyProtein: Math.round(u.weight * 1.8),
              dailyCarbs: 240,
              dailyFat: 70,
              dailyWater: 2.5,
              dietaryPreferences: u.dietaryPreferences || [],
              favoriteCuisines: u.favoriteFoods || [],
              allergens: u.allergens || [],
              units: 'metric',
              theme: 'light',
              notifications: {
                aiInsights: true,
                mealReminders: true,
                workoutReminders: true,
                hydrationReminders: true,
                weeklyReport: true,
              },
              aiProactiveFrequency: 'high',
            },
          };
        }
        return { success: false, error: resData.error || 'Registration failed.' };
      }

      const direct = await VeyraApiRouter.handleSignup(data);
      if (direct.response.success && direct.response.data) {
        const u = direct.response.data.user;
        VeyraApiClient.setSession(direct.response.data.token, u.id);
        return {
          success: true,
          token: direct.response.data.token,
          user: {
            name: `${u.firstName} ${u.lastName}`.trim(),
            email: u.email,
            age: u.age,
            heightCm: u.height,
            weightKg: u.weight,
            targetWeightKg: u.targetWeight,
            goal: u.wellnessGoal as any,
            activityLevel: u.activityLevel as any,
            dailyCalories: u.wellnessGoal === 'Lose Weight' ? 1900 : 2300,
            dailyProtein: Math.round(u.weight * 1.8),
            dailyCarbs: 240,
            dailyFat: 70,
            dailyWater: 2.5,
            dietaryPreferences: u.dietaryPreferences || [],
            favoriteCuisines: u.favoriteFoods || [],
            allergens: u.allergens || [],
            units: 'metric',
            theme: 'light',
            notifications: {
              aiInsights: true,
              mealReminders: true,
              workoutReminders: true,
              hydrationReminders: true,
              weeklyReport: true,
            },
            aiProactiveFrequency: 'high',
          },
        };
      }
      return { success: false, error: direct.response.error || 'Registration failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }

  // Profile API
  static async updateProfile(fields: Partial<UserProfile>): Promise<UserProfile> {
    const userId = VeyraApiClient.getActiveUserId();
    const nameParts = (fields.name || '').split(' ');
    const firstName = nameParts[0] || 'Member';
    const lastName = nameParts.slice(1).join(' ') || '';

    const res = await VeyraApiRouter.updateProfile(userId, {
      ...(fields.name ? { firstName, lastName } : {}),
      ...(fields.weightKg ? { weight: fields.weightKg } : {}),
      ...(fields.targetWeightKg ? { targetWeight: fields.targetWeightKg } : {}),
      ...(fields.goal ? { wellnessGoal: fields.goal } : {}),
      ...(fields.activityLevel ? { activityLevel: fields.activityLevel } : {}),
      ...(fields.dietaryPreferences ? { dietaryPreferences: fields.dietaryPreferences } : {}),
      ...(fields.allergens ? { allergens: fields.allergens } : {}),
    });

    if (res.success && res.data) {
      const u = res.data;
      return {
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        age: u.age,
        heightCm: u.height,
        weightKg: u.weight,
        targetWeightKg: u.targetWeight,
        goal: u.wellnessGoal as any,
        activityLevel: u.activityLevel as any,
        dailyCalories: u.wellnessGoal === 'Lose Weight' ? 1900 : 2300,
        dailyProtein: Math.round(u.weight * 1.8),
        dailyCarbs: 240,
        dailyFat: 70,
        dailyWater: 2.5,
        dietaryPreferences: u.dietaryPreferences || [],
        favoriteCuisines: u.favoriteFoods || [],
        allergens: u.allergens || [],
        units: 'metric',
        theme: 'light',
        notifications: {
          aiInsights: true,
          mealReminders: true,
          workoutReminders: true,
          hydrationReminders: true,
          weeklyReport: true,
        },
        aiProactiveFrequency: 'high',
      };
    }
    throw new Error(res.error || 'Failed to update profile');
  }

  // Food Log APIs
  static async getFoodLog(date?: string): Promise<{ logs: LoggedMealEntry[]; summary: any }> {
    const userId = VeyraApiClient.getActiveUserId();
    const res = await VeyraApiRouter.getFoodLog(userId, date);
    if (res.success && res.data) {
      const logs: LoggedMealEntry[] = res.data.logs.map((l: any) => ({
        id: l.id,
        foodId: l.productBarcode || l.id,
        name: l.productName,
        sectionId: l.mealType || 'lunch',
        servings: l.servings || 1,
        grams: l.grams || 100,
        calories: l.calories,
        protein: l.protein,
        carbs: l.carbs,
        fat: l.fat,
        time: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        img: l.imageUrl || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=80&h=80&fit=crop&auto=format',
      }));
      return { logs, summary: res.data.summary };
    }
    return { logs: [], summary: {} };
  }

  static async addFoodLog(entry: Omit<LoggedMealEntry, 'id'>): Promise<LoggedMealEntry> {
    const userId = VeyraApiClient.getActiveUserId();
    const res = await VeyraApiRouter.addFoodLog(userId, {
      sectionId: entry.sectionId,
      name: entry.name,
      productBarcode: String(entry.foodId),
      grams: entry.grams,
      servings: entry.servings,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      imageUrl: entry.img,
    });

    if (res.success && res.data) {
      const l = res.data;
      return {
        id: l.id,
        foodId: l.productBarcode || l.id,
        name: l.productName,
        sectionId: l.mealType as any,
        servings: l.servings,
        grams: l.grams,
        calories: l.calories,
        protein: l.protein,
        carbs: l.carbs,
        fat: l.fat,
        time: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        img: l.imageUrl || '',
      };
    }
    throw new Error(res.error || 'Failed to log food entry');
  }

  static async deleteFoodLog(id: string): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    const res = await VeyraApiRouter.deleteFoodLog(userId, id);
    return res.success;
  }

  // Scan History APIs
  static async getScans(): Promise<Array<{ code: string; product: FoodItem; timestamp: string }>> {
    const userId = VeyraApiClient.getActiveUserId();
    const res = await VeyraApiRouter.getScans(userId);
    if (res.success && Array.isArray(res.data)) {
      return res.data.map((s: any) => ({
        code: s.barcode,
        product: s.productJson || {
          id: s.barcode,
          name: s.productName,
          brand: s.brand || 'Verified Brand',
          category: 'Snack',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          portionGrams: 100,
          score: 8,
          img: s.imageUrl || '',
          barcode: s.barcode,
        },
        timestamp: new Date(s.scannedAt).toLocaleTimeString([], { dateStyle: 'short', timeStyle: 'short' }),
      }));
    }
    return [];
  }

  static async addScan(code: string, product: FoodItem): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    const res = await VeyraApiRouter.addScan(userId, {
      barcode: code,
      productName: product.name,
      brand: product.brand,
      imageUrl: product.img,
      productJson: product,
    });
    return res.success;
  }

  // Workout History APIs
  static async getWorkouts(): Promise<WorkoutRoutine[]> {
    const userId = VeyraApiClient.getActiveUserId();
    const res = await VeyraApiRouter.getWorkouts(userId);
    if (res.success && Array.isArray(res.data)) {
      return res.data.map((w: any) => ({
        id: w.id,
        name: w.workoutName,
        category: 'Weight Loss',
        difficulty: 'Intermediate',
        durationMin: w.duration,
        caloriesBurned: w.caloriesBurned || 250,
        muscles: 'Full Body',
        equipment: 'Bodyweight',
        img: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&h=300&fit=crop&auto=format',
        description: 'Recorded workout routine',
        exercises: [],
      }));
    }
    
    return [];
  }

  static async addWorkout(w: WorkoutRoutine): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workoutName: w.name, duration: w.durationMin, caloriesBurned: w.caloriesBurned }),
      });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.addWorkout(userId, {
      workoutName: w.name,
      duration: w.durationMin,
      caloriesBurned: w.caloriesBurned,
    });
    return res.success;
  }

  // Water API
  static async updateWater(waterConsumed: number, date?: string): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    const d = date || new Date().toISOString().split('T')[0];
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/water?date=${d}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ waterConsumed }),
      });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.updateWater(userId, d, waterConsumed);
    return res.success;
  }

  // Pantry APIs
  static async getPantry(): Promise<any[]> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/pantry', { credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getPantryItems(userId);
    return res.success ? res.data : [];
  }

  static async addPantryItem(item: { name: string; quantity: number; unit: string; expirationDate?: string }): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(item),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    const res = await VeyraApiRouter.addPantryItem(userId, item);
    return res.success ? res.data : null;
  }

  static async updatePantryItem(id: string, updates: any): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/pantry?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    const res = await VeyraApiRouter.updatePantryItem(userId, id, updates);
    return res.success ? res.data : null;
  }

  static async deletePantryItem(id: string): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/pantry?id=${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.deletePantryItem(userId, id);
    return res.success;
  }

  // Shopping List APIs
  static async getShoppingList(): Promise<any[]> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/shopping-list', { credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getShoppingList(userId);
    return res.success ? res.data : [];
  }

  static async addShoppingListItem(item: { name: string; quantity: number; unit: string; recipeId?: string }): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(item),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    const res = await VeyraApiRouter.addShoppingListItem(userId, item);
    return res.success ? res.data : null;
  }

  static async addBatchShoppingList(items: Array<{ name: string; quantity: number; unit: string; recipeId?: string }>): Promise<any[]> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.addBatchShoppingList(userId, items);
    return res.success ? res.data : [];
  }

  static async updateShoppingListItem(id: string, updates: any): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/shopping-list?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    const res = await VeyraApiRouter.updateShoppingListItem(userId, id, updates);
    return res.success ? res.data : null;
  }

  static async deleteShoppingListItem(id: string): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/shopping-list?id=${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.deleteShoppingListItem(userId, id);
    return res.success;
  }

  static async clearPurchasedShoppingList(): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/shopping-list?action=clear-purchased', { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.clearPurchasedShoppingList(userId);
    return res.success;
  }

  static async clearEntireShoppingList(): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/shopping-list?action=clear-all', { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.clearEntireShoppingList(userId);
    return res.success;
  }

  // Meal Plan APIs
  static async getMealPlan(weekStartDate: string): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/meal-plan?week=${weekStartDate}`, { credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    const res = await VeyraApiRouter.getMealPlan(userId, weekStartDate);
    return res.success ? res.data : null;
  }

  static async saveMealPlan(weekStartDate: string, mealsJson: any): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    const str = typeof mealsJson === 'string' ? mealsJson : JSON.stringify(mealsJson);
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/meal-plan?week=${weekStartDate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mealsJson: str }),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    const res = await VeyraApiRouter.saveMealPlan(userId, weekStartDate, str);
    return res.success ? res.data : null;
  }

  static async generateMealPlan(weekStartDate: string): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/meal-plan?week=${weekStartDate}&action=generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    return null;
  }

  // Weight History APIs
  static async getWeightHistory(): Promise<any[]> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/weight-history', { credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getWeightHistory(userId);
    return res.success ? res.data : [];
  }

  static async addWeightEntry(weight: number, date?: string): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/weight-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ weight, date }),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    const res = await VeyraApiRouter.addWeightEntry(userId, weight, date);
    return res.success ? res.data : null;
  }

  // Favorites APIs
  static async getFavorites(): Promise<any[]> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/favorites', { credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getFavorites(userId);
    return res.success ? res.data : [];
  }

  static async addFavorite(recipe: { recipeId: string; recipeTitle: string; recipeImage?: string; recipeCategory?: string; recipeCountry?: string }): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(recipe),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    const res = await VeyraApiRouter.addFavorite(userId, recipe);
    return res.success ? res.data : null;
  }

  static async removeFavorite(recipeId: string): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/favorites?recipeId=${recipeId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.removeFavorite(userId, recipeId);
    return res.success;
  }

  // Recipe Reviews APIs
  static async getRecipeReviews(recipeId: string): Promise<any[]> {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/reviews?recipeId=${recipeId}`);
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getRecipeReviews(recipeId);
    return res.success ? res.data : [];
  }

  static async addRecipeReview(recipeId: string, rating: number, text: string): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipeId, rating, text }),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    const res = await VeyraApiRouter.addRecipeReview(userId, recipeId, rating, text);
    return res.success ? res.data : null;
  }

  static async updateRecipeReview(id: string, rating: number, text: string): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/reviews?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, text }),
      });
      const data = await res.json();
      return data.success ? data.data : null;
    }
    const res = await VeyraApiRouter.updateRecipeReview(userId, id, rating, text);
    return res.success ? res.data : null;
  }

  static async deleteRecipeReview(id: string): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.deleteRecipeReview(userId, id);
    return res.success;
  }

  // Notifications APIs
  static async getNotifications(): Promise<any[]> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getNotifications(userId);
    return res.success ? res.data : [];
  }

  static async markNotificationAsRead(id: string): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/notifications?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isRead: true }),
      });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.markNotificationAsRead(userId, id);
    return res.success;
  }
}

