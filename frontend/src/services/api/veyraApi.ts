import { UserProfile, LoggedMealEntry, FoodItem, WorkoutRoutine } from '../../types';
import { API_BASE_URL, apiFetch, apiUrl, getToken, setToken as setBackendToken, getAuthHeader } from './backendClient';

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


  private static isMongoBackend(): boolean {
    return Boolean(API_BASE_URL);
  }
  private static async mongoFetch(path: string, opts: RequestInit = {}): Promise<Response> {
    return apiFetch(path, opts);
  }
  private static persistToken(token: string, userId: string) {
    VeyraApiClient.authToken = token;
    VeyraApiClient.activeUserId = userId;
    try { if (typeof window !== "undefined") { localStorage.setItem("veyra_token", token); localStorage.setItem("veyra_user_id", userId); } } catch {}
    setBackendToken(token);
  }
  static getStoredToken(): string | null {
    if (VeyraApiClient.authToken) return VeyraApiClient.authToken;
    try { return typeof window !== "undefined" ? localStorage.getItem("veyra_token") : null; } catch { return null; }
  }
  static getActiveUserId(): string {
    return VeyraApiClient.activeUserId || 'usr_default_veyra_member';
  }

  // Auth APIs
  static async login(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; token?: string; error?: string }> {
    try {
      // In browser environment, send HTTP request to backend endpoint
      if (typeof window !== 'undefined') {
        const _loginUrl = VeyraApiClient.isMongoBackend() ? apiUrl('/auth/login') : '/api/auth/login';
        const _loginHeaders: Record<string,string> = { 'Content-Type': 'application/json', ...getAuthHeader() };
        const res = await fetch(_loginUrl, {
          method: 'POST',
          headers: _loginHeaders,
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          const u = data.data.user;
          const _tok = data.data.token;
          VeyraApiClient.persistToken(_tok, u.id || u._id);
          VeyraApiClient.setSession(_tok, u.id || u._id);
          return {
            success: true,
            token: _tok,
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
        const _signupUrl = VeyraApiClient.isMongoBackend() ? apiUrl('/auth/signup') : '/api/auth/signup';
        const _signupHeaders: Record<string,string> = { 'Content-Type': 'application/json', ...getAuthHeader() };
        const res = await fetch(_signupUrl, {
          method: 'POST',
          headers: _signupHeaders,
          credentials: 'include',
          body: JSON.stringify(data),
        });
        const resData = await res.json();
        if (res.ok && resData.success && resData.data) {
          const u = resData.data.user;
          const _tok2 = resData.data.token;
          VeyraApiClient.persistToken(_tok2, u.id || u._id);
          VeyraApiClient.setSession(_tok2, u.id || u._id);
          return {
            success: true,
            token: _tok2,
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
    if (VeyraApiClient.isMongoBackend() && typeof window !== 'undefined') {
      try {
        const nameParts = (fields.name || '').split(' ');
        const firstName = nameParts[0] || undefined;
        const lastName = nameParts.slice(1).join(' ') || undefined;
        const body: any = {};
        if (firstName) body.firstName = firstName;
        if (lastName) body.lastName = lastName;
        if (fields.weightKg !== undefined) body.weight = fields.weightKg;
        if (fields.targetWeightKg !== undefined) body.targetWeight = fields.targetWeightKg;
        if (fields.goal) body.wellnessGoal = fields.goal;
        if (fields.activityLevel) body.activityLevel = fields.activityLevel;
        if (fields.dietaryPreferences) body.dietaryPreferences = fields.dietaryPreferences;
        if (fields.allergens) body.allergens = fields.allergens;
        const res = await apiFetch('/users', { method: 'PUT', body: JSON.stringify({ ...fields, firstName: firstName || (fields as any).firstName, lastName: lastName || (fields as any).lastName, ...body }) });
        const j = await res.json().catch(()=>null);
        const d = j && j.data ? j.data : j;
        const u = d && d.user ? d.user : d;
        if (u && (u.email || u.firstName)) {
          const mapped: UserProfile = {
            name: u.name || `${u.firstName||''} ${u.lastName||''}`.trim() || fields.name || 'Member',
            email: u.email || fields.email || '',
            age: u.age ?? fields.age ?? 28,
            heightCm: u.height ?? u.heightCm ?? fields.heightCm ?? 178,
            weightKg: u.weight ?? u.weightKg ?? fields.weightKg ?? 80,
            targetWeightKg: u.targetWeight ?? u.targetWeightKg ?? fields.targetWeightKg ?? 75,
            goal: (u.wellnessGoal || u.goal || fields.goal || 'Lose Weight') as any,
            activityLevel: (u.activityLevel || fields.activityLevel || 'moderate') as any,
            dailyCalories: u.dailyCalories || 2100,
            dailyProtein: u.dailyProtein || Math.round((u.weight||80)*1.8),
            dailyCarbs: u.dailyCarbs || 240,
            dailyFat: u.dailyFat || 70,
            dailyWater: u.dailyWater || 2.5,
            dietaryPreferences: u.dietaryPreferences || fields.dietaryPreferences || [],
            favoriteCuisines: u.favoriteFoods || u.favoriteCuisines || fields.favoriteCuisines || [],
            allergens: u.allergens || fields.allergens || [],
            units: 'metric', theme: 'light',
            notifications: { aiInsights:true, mealReminders:true, workoutReminders:true, hydrationReminders:true, weeklyReport:true },
            aiProactiveFrequency: 'high',
          };
          return mapped;
        }
      } catch (e) { console.warn('mongo updateProfile fallback', e); }
    }
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
    if (VeyraApiClient.isMongoBackend() && typeof window !== 'undefined') {
      try {
        const q = date ? `?date=${encodeURIComponent(date)}` : '';
        const res = await apiFetch(`/food-log${q}`, { method: 'GET' });
        const j = await res.json().catch(()=>null);
        const d = j && j.data ? j.data : j;
        // backend returns { logs: [...] } or { logs, summary } or array?
        const rawLogs = d?.logs || (Array.isArray(d) ? d : d?.data?.logs) || [];
        const logs: LoggedMealEntry[] = (rawLogs as any[]).map((l:any)=>({
          id: l._id || l.id,
          foodId: l.productBarcode || l.foodId || l._id || l.id,
          name: l.productName || l.name,
          sectionId: (l.mealType || l.sectionId || 'lunch').toLowerCase(),
          servings: l.servings || 1,
          grams: l.grams || 100,
          calories: l.calories||0,
          protein: l.protein||0,
          carbs: l.carbs||0,
          fat: l.fat||0,
          time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
          img: l.imageUrl || l.img || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=80&h=80&fit=crop&auto=format',
        }));
        return { logs, summary: d?.summary || {} };
      } catch(e){ console.warn('mongo getFoodLog fallback', e); }
    }
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
    if (VeyraApiClient.isMongoBackend() && typeof window !== 'undefined') {
      try {
        const payload: any = {
          name: entry.name,
          productName: entry.name,
          productBarcode: String(entry.foodId),
          sectionId: entry.sectionId,
          mealType: entry.sectionId,
          grams: entry.grams,
          servings: entry.servings,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          imageUrl: entry.img,
          date: new Date().toISOString().split('T')[0],
        };
        const res = await apiFetch('/food-log', { method: 'POST', body: JSON.stringify(payload) });
        const j = await res.json().catch(()=>null);
        const d = j && j.data ? j.data : j;
        const l = d || {};
        return {
          id: l._id || l.id || `meal-${Date.now()}`,
          foodId: l.productBarcode || l.foodId || entry.foodId,
          name: l.productName || l.name || entry.name,
          sectionId: (l.mealType || entry.sectionId) as any,
          servings: l.servings || entry.servings,
          grams: l.grams || entry.grams,
          calories: l.calories ?? entry.calories,
          protein: l.protein ?? entry.protein,
          carbs: l.carbs ?? entry.carbs,
          fat: l.fat ?? entry.fat,
          time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
          img: l.imageUrl || l.img || entry.img,
        };
      } catch(e){ console.warn('mongo addFoodLog fallback', e); }
    }
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
    if (VeyraApiClient.isMongoBackend() && typeof window !== 'undefined') {
      try {
        const res = await apiFetch(`/food-log/${encodeURIComponent(id)}`, { method: 'DELETE' });
        const j = await res.json().catch(()=>null);
        return Boolean(j?.success ?? res.ok);
      } catch(e){ console.warn('mongo deleteFoodLog fallback', e); }
    }
    const userId = VeyraApiClient.getActiveUserId();
    const res = await VeyraApiRouter.deleteFoodLog(userId, id);
    return res.success;
  }

  // Scan History APIs
  static async getScans(): Promise<Array<{ code: string; product: FoodItem; timestamp: string }>> {
    if (VeyraApiClient.isMongoBackend() && typeof window !== 'undefined') {
      try {
        const res = await apiFetch('/scans', { method: 'GET' });
        const j = await res.json().catch(()=>null);
        const d = j && j.data ? j.data : (Array.isArray(j) ? j : []);
        if (Array.isArray(d)) {
          return d.map((s:any)=>({
            code: s.barcode || s.code,
            product: s.productJson || { id: s.barcode, name: s.productName, brand: s.brand, category:'Snack', calories:0, protein:0, carbs:0, fat:0, portionGrams:100, score:8, img: s.imageUrl||'', barcode: s.barcode } as any,
            timestamp: s.scannedAt ? new Date(s.scannedAt).toLocaleTimeString([], {dateStyle:'short', timeStyle:'short'} as any) : new Date(s.createdAt).toLocaleTimeString([], {dateStyle:'short', timeStyle:'short'} as any),
          }));
        }
      } catch(e){ console.warn('mongo getScans fallback', e); }
    }
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
    if (VeyraApiClient.isMongoBackend() && typeof window !== 'undefined') {
      try {
        const res = await apiFetch('/scans', { method: 'POST', body: JSON.stringify({ barcode: code, productName: product.name, brand: product.brand, imageUrl: product.img, productJson: product }) });
        const j = await res.json().catch(()=>null);
        return Boolean(j?.success ?? res.ok);
      } catch(e){ console.warn('mongo addScan fallback', e); }
    }
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
    if (VeyraApiClient.isMongoBackend() && typeof window !== 'undefined') {
      try {
        const res = await apiFetch('/workouts', { method: 'GET' });
        const j = await res.json().catch(()=>null);
        const d = j && j.data ? j.data : (Array.isArray(j) ? j : []);
        if (Array.isArray(d)) {
          return d.map((w:any)=>({
            id: w._id || w.id,
            name: w.workoutName || w.name,
            category: 'Weight Loss' as any,
            difficulty: 'Intermediate' as any,
            durationMin: w.duration || w.durationMin || 30,
            caloriesBurned: w.caloriesBurned || 250,
            muscles: 'Full Body', equipment: 'Bodyweight',
            img: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&h=300&fit=crop&auto=format',
            description: 'Recorded workout routine', exercises: [],
          }));
        }
      } catch(e){ console.warn('mongo getWorkouts fallback', e); }
    }
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/workouts') : '/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/nutrition/water?date=${d}`) : `/api/water?date=${d}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/pantry') : '/api/pantry', { headers: { ...getAuthHeader() }, credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getPantryItems(userId);
    return res.success ? res.data : [];
  }

  static async addPantryItem(item: { name: string; quantity: number; unit: string; expirationDate?: string }): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/pantry') : '/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/pantry/${id}`) : `/api/pantry?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/pantry/${id}`) : `/api/pantry?id=${id}`, { method: 'DELETE', credentials: 'include' });
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/shopping-list') : '/api/shopping-list', { headers: { ...getAuthHeader() }, credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getShoppingList(userId);
    return res.success ? res.data : [];
  }

  static async addShoppingListItem(item: { name: string; quantity: number; unit: string; recipeId?: string }): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/shopping-list') : '/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/shopping-list') : '/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/shopping-list/${id}`) : `/api/shopping-list?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/shopping-list/${id}`) : `/api/shopping-list?id=${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.deleteShoppingListItem(userId, id);
    return res.success;
  }

  static async clearPurchasedShoppingList(): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/shopping-list?action=clear-purchased') : '/api/shopping-list?action=clear-purchased', { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.clearPurchasedShoppingList(userId);
    return res.success;
  }

  static async clearEntireShoppingList(): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/shopping-list?action=clear-all') : '/api/shopping-list?action=clear-all', { method: 'DELETE', credentials: 'include' });
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/meal-plan?week=${weekStartDate}`) : `/api/meal-plan?week=${weekStartDate}`, { credentials: 'include' });
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/meal-plan?week=${weekStartDate}`) : `/api/meal-plan?week=${weekStartDate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/meal-plan/generate?week=${weekStartDate}`) : `/api/meal-plan?week=${weekStartDate}&action=generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/weight-history') : '/api/weight-history', { headers: { ...getAuthHeader() }, credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getWeightHistory(userId);
    return res.success ? res.data : [];
  }

  static async addWeightEntry(weight: number, date?: string): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/weight-history') : '/api/weight-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/favorites') : '/api/favorites', { headers: { ...getAuthHeader() }, credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getFavorites(userId);
    return res.success ? res.data : [];
  }

  static async addFavorite(recipe: { recipeId: string; recipeTitle: string; recipeImage?: string; recipeCategory?: string; recipeCountry?: string }): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/favorites') : '/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/favorites?recipeId=${recipeId}`) : `/api/favorites?recipeId=${recipeId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      return data.success;
    }
    const res = await VeyraApiRouter.removeFavorite(userId, recipeId);
    return res.success;
  }

  // Recipe Reviews APIs
  static async getRecipeReviews(recipeId: string): Promise<any[]> {
    if (typeof window !== 'undefined') {
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/reviews?recipeId=${recipeId}`) : `/api/reviews?recipeId=${recipeId}`);
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getRecipeReviews(recipeId);
    return res.success ? res.data : [];
  }

  static async addRecipeReview(recipeId: string, rating: number, text: string): Promise<any> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/reviews') : '/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/reviews/${id}`) : `/api/reviews?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/reviews/${id}`) : `/api/reviews?id=${id}`, { method: 'DELETE', credentials: 'include' });
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
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl('/notifications') : '/api/notifications', { headers: { ...getAuthHeader() }, credentials: 'include' });
      const data = await res.json();
      return data.success ? data.data : [];
    }
    const res = await VeyraApiRouter.getNotifications(userId);
    return res.success ? res.data : [];
  }

  static async markNotificationAsRead(id: string): Promise<boolean> {
    const userId = VeyraApiClient.getActiveUserId();
    if (typeof window !== 'undefined') {
      const res = await fetch(VeyraApiClient.isMongoBackend() ? apiUrl(`/notifications/${id}`) : `/api/notifications?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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

