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
    const res = await VeyraApiRouter.addWorkout(userId, {
      workoutName: w.name,
      duration: w.durationMin,
      caloriesBurned: w.caloriesBurned,
    });
    return res.success;
  }
}
