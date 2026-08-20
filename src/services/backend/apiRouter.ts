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
}
