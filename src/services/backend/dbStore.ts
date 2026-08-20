import { UserProfile, LoggedMealEntry, FoodItem, WorkoutRoutine } from '../../types';
import { hashPassword } from './authCrypto';
import { neon } from '@neondatabase/serverless';

export interface DbUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string; // Formatted as "saltHex:hashHex"
  wellnessGoal: 'Lose Weight' | 'Build Muscle' | 'Maintain Weight' | 'Improve Fitness';
  age: number;
  gender?: string;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very';
  dietaryPreferences: string[];
  allergens: string[];
  favoriteFoods: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DbDailyNutrition {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  calorieTarget: number;
  caloriesConsumed: number;
  proteinTarget: number;
  proteinConsumed: number;
  carbsTarget: number;
  carbsConsumed: number;
  fatTarget: number;
  fatConsumed: number;
  waterTarget: number;
  waterConsumed: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbFoodLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'drinks';
  productBarcode?: string;
  productName: string;
  brand?: string;
  imageUrl?: string;
  servingSize?: string;
  grams: number;
  servings: number;

  // Verified Nutrition
  calories: number;
  protein: number;
  carbs: number;
  sugar?: number;
  fiber?: number;
  fat: number;
  saturatedFat?: number;
  sodium?: number;

  healthScore?: number;
  novagroup?: number;
  nutriscoreGrade?: string;
  healthTags?: string[];
  additives?: string[];
  createdAt: string;
}

export interface DbScanHistory {
  id: string;
  userId: string;
  barcode: string;
  productName: string;
  brand?: string;
  imageUrl?: string;
  nutriscoreGrade?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore?: number;
  verdict: string;
  productJson?: string;
  scannedAt?: string;
  createdAt: string;
}

export interface DbWorkoutHistory {
  id: string;
  userId: string;
  routineName: string;
  category: string;
  durationMinutes: number;
  caloriesBurned: number;
  completedAt: string;
  createdAt: string;
}

// Stateless Neon HTTP Query Executor for Vercel Edge & Serverless Functions
async function neonQuery(sqlQuery: string, params: any[] = []): Promise<any[] | null> {
  if (typeof process === 'undefined' || !process.env.DATABASE_URL) {
    return null;
  }
  const sql = neon(process.env.DATABASE_URL);
  const res = await (sql as any).query(sqlQuery, params);
  return (res?.rows || res) as any[];
}

export class DbStore {
  private users: Map<string, DbUser> = new Map();
  private dailyNutritions: Map<string, DbDailyNutrition> = new Map();
  private foodLogs: Map<string, DbFoodLog> = new Map();
  private scanHistories: Map<string, DbScanHistory> = new Map();
  private workoutHistories: Map<string, DbWorkoutHistory> = new Map();

  private safeDateIso(val: any): string {
    if (!val) return new Date().toISOString();
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  private safeArray(val: any): string[] {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    if (typeof val === 'string') {
      if (val.startsWith('{') && val.endsWith('}')) {
        const raw = val.slice(1, -1).trim();
        return raw ? raw.split(',').map((s) => s.replace(/^"|"$/g, '')) : [];
      }
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private mapUserRow(r: any): DbUser {
    return {
      id: String(r.id),
      firstName: String(r.firstName || ''),
      lastName: String(r.lastName || ''),
      email: String(r.email || ''),
      passwordHash: String(r.passwordHash || ''),
      wellnessGoal: r.wellnessGoal || 'Improve Fitness',
      age: Number(r.age) || 28,
      height: Number(r.height) || 175,
      weight: Number(r.weight) || 70,
      targetWeight: Number(r.targetWeight) || 70,
      activityLevel: r.activityLevel || 'moderate',
      dietaryPreferences: this.safeArray(r.dietaryPreferences),
      allergens: this.safeArray(r.allergens),
      favoriteFoods: this.safeArray(r.favoriteFoods),
      createdAt: this.safeDateIso(r.createdAt),
      updatedAt: this.safeDateIso(r.updatedAt),
    };
  }

  // User Operations
  async createUser(data: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbUser> {
    const cleanEmail = data.email.toLowerCase().trim();

    if (process.env.DATABASE_URL) {
      const existingRows = await neonQuery('SELECT id FROM "User" WHERE email = $1', [cleanEmail]);
      if (existingRows && existingRows.length > 0) {
        throw new Error('An account with this email already exists.');
      }

      const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date();

      const insertRows = await neonQuery(
        `INSERT INTO "User" (
          "id", "firstName", "lastName", "email", "passwordHash", "wellnessGoal",
          "age", "height", "weight", "targetWeight", "activityLevel",
          "dietaryPreferences", "allergens", "favoriteFoods", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          id,
          data.firstName,
          data.lastName,
          cleanEmail,
          data.passwordHash,
          data.wellnessGoal,
          data.age,
          data.height,
          data.weight,
          data.targetWeight,
          data.activityLevel,
          data.dietaryPreferences || [],
          data.allergens || [],
          data.favoriteFoods || [],
          now,
          now,
        ]
      );

      if (insertRows && insertRows.length > 0) {
        return this.mapUserRow(insertRows[0]);
      }
    }

    // In-memory fallback if no DATABASE_URL set
    if (this.users.has(`email_${cleanEmail}`)) {
      throw new Error('An account with this email already exists.');
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const user: DbUser = {
      ...data,
      id,
      email: cleanEmail,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    this.users.set(`email_${cleanEmail}`, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<DbUser | null> {
    const cleanEmail = email.toLowerCase().trim();

    if (process.env.DATABASE_URL) {
      const rows = await neonQuery('SELECT * FROM "User" WHERE email = $1', [cleanEmail]);
      if (!rows || rows.length === 0) return null;
      return this.mapUserRow(rows[0]);
    }

    return this.users.get(`email_${cleanEmail}`) || null;
  }

  async getUserById(id: string): Promise<DbUser | null> {
    if (process.env.DATABASE_URL) {
      const rows = await neonQuery('SELECT * FROM "User" WHERE id = $1', [id]);
      if (!rows || rows.length === 0) return null;
      return this.mapUserRow(rows[0]);
    }

    return this.users.get(id) || null;
  }

  async updateUser(id: string, updates: Partial<DbUser>): Promise<DbUser> {
    if (process.env.DATABASE_URL) {
      const rows = await neonQuery(
        `UPDATE "User" SET
          "firstName" = COALESCE($1, "firstName"),
          "lastName" = COALESCE($2, "lastName"),
          "weight" = COALESCE($3, "weight"),
          "targetWeight" = COALESCE($4, "targetWeight"),
          "wellnessGoal" = COALESCE($5, "wellnessGoal"),
          "activityLevel" = COALESCE($6, "activityLevel"),
          "updatedAt" = NOW()
        WHERE id = $7
        RETURNING *`,
        [
          updates.firstName || null,
          updates.lastName || null,
          updates.weight || null,
          updates.targetWeight || null,
          updates.wellnessGoal || null,
          updates.activityLevel || null,
          id,
        ]
      );

      if (!rows || rows.length === 0) throw new Error('User not found');
      return this.mapUserRow(rows[0]);
    }

    const existing = this.users.get(id);
    if (!existing) throw new Error('User not found');

    const updated: DbUser = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updated);
    this.users.set(`email_${updated.email}`, updated);
    return updated;
  }

  // Daily Nutrition Operations
  async getDailyNutrition(userId: string, date: string): Promise<DbDailyNutrition> {
    if (process.env.DATABASE_URL) {
      const rows = await neonQuery('SELECT * FROM "DailyNutrition" WHERE "userId" = $1 AND "date" = $2', [
        userId,
        date,
      ]);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          userId: r.userId,
          date: r.date,
          calorieTarget: r.calorieTarget,
          caloriesConsumed: r.caloriesConsumed,
          proteinTarget: r.proteinTarget,
          proteinConsumed: r.proteinConsumed,
          carbsTarget: r.carbsTarget,
          carbsConsumed: r.carbsConsumed,
          fatTarget: r.fatTarget,
          fatConsumed: r.fatConsumed,
          waterTarget: r.waterTarget,
          waterConsumed: r.waterConsumed,
          createdAt: this.safeDateIso(r.createdAt),
          updatedAt: this.safeDateIso(r.updatedAt),
        };
      }

      // Create default target row for today if missing
      const id = `dn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date();
      const insertRows = await neonQuery(
        `INSERT INTO "DailyNutrition" (
          "id", "userId", "date", "calorieTarget", "caloriesConsumed",
          "proteinTarget", "proteinConsumed", "carbsTarget", "carbsConsumed",
          "fatTarget", "fatConsumed", "waterTarget", "waterConsumed", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, 2000, 0, 140, 0, 220, 0, 65, 0, 2500, 0, $4, $5)
        RETURNING *`,
        [id, userId, date, now, now]
      );
      const r = (insertRows && insertRows[0]) || {};
      return {
        id: r.id || id,
        userId: r.userId || userId,
        date: r.date || date,
        calorieTarget: r.calorieTarget || 2000,
        caloriesConsumed: r.caloriesConsumed || 0,
        proteinTarget: r.proteinTarget || 140,
        proteinConsumed: r.proteinConsumed || 0,
        carbsTarget: r.carbsTarget || 220,
        carbsConsumed: r.carbsConsumed || 0,
        fatTarget: r.fatTarget || 65,
        fatConsumed: r.fatConsumed || 0,
        waterTarget: r.waterTarget || 2500,
        waterConsumed: r.waterConsumed || 0,
        createdAt: this.safeDateIso(r.createdAt),
        updatedAt: this.safeDateIso(r.updatedAt),
      };
    }

    const key = `${userId}_${date}`;
    if (!this.dailyNutritions.has(key)) {
      const now = new Date().toISOString();
      const defaultDaily: DbDailyNutrition = {
        id: `dn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId,
        date,
        calorieTarget: 2000,
        caloriesConsumed: 0,
        proteinTarget: 140,
        proteinConsumed: 0,
        carbsTarget: 220,
        carbsConsumed: 0,
        fatTarget: 65,
        fatConsumed: 0,
        waterTarget: 2500,
        waterConsumed: 0,
        createdAt: now,
        updatedAt: now,
      };
      this.dailyNutritions.set(key, defaultDaily);
    }
    return this.dailyNutritions.get(key)!;
  }

  // Food Log Operations
  async getFoodLogs(userId: string, date?: string): Promise<DbFoodLog[]> {
    if (process.env.DATABASE_URL) {
      let query = 'SELECT * FROM "FoodLog" WHERE "userId" = $1';
      const params: any[] = [userId];

      if (date) {
        query += ' AND "date" = $2';
        params.push(date);
      }
      query += ' ORDER BY "createdAt" DESC';

      const rows = await neonQuery(query, params);
      if (!rows) return [];
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        date: r.date,
        mealType: r.mealType,
        productBarcode: r.productBarcode || undefined,
        productName: r.productName,
        brand: r.brand || undefined,
        imageUrl: r.imageUrl || undefined,
        servingSize: r.servingSize || undefined,
        grams: r.grams,
        servings: r.servings,
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fat: r.fat,
        sugar: r.sugar ?? undefined,
        fiber: r.fiber ?? undefined,
        saturatedFat: r.saturatedFat ?? undefined,
        sodium: r.sodium ?? undefined,
        healthScore: r.healthScore ?? undefined,
        novagroup: r.novagroup ?? undefined,
        nutriscoreGrade: r.nutriscoreGrade || undefined,
        healthTags: this.safeArray(r.healthTags),
        additives: this.safeArray(r.additives),
        createdAt: this.safeDateIso(r.createdAt),
      }));
    }

    const userLogs = Array.from(this.foodLogs.values()).filter((log) => log.userId === userId);
    if (date) {
      return userLogs.filter((log) => log.date === date);
    }
    return userLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addFoodLog(userId: string, logData: Omit<DbFoodLog, 'id' | 'userId' | 'createdAt'>): Promise<DbFoodLog> {
    if (process.env.DATABASE_URL) {
      const id = `fl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date();

      const insertRows = await neonQuery(
        `INSERT INTO "FoodLog" (
          "id", "userId", "date", "mealType", "productBarcode", "productName",
          "brand", "imageUrl", "servingSize", "grams", "servings", "calories",
          "protein", "carbs", "fat", "sugar", "fiber", "saturatedFat", "sodium",
          "healthScore", "novagroup", "nutriscoreGrade", "healthTags", "additives", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        RETURNING *`,
        [
          id,
          userId,
          logData.date,
          logData.mealType,
          logData.productBarcode || null,
          logData.productName,
          logData.brand || null,
          logData.imageUrl || null,
          logData.servingSize || null,
          logData.grams || 100,
          logData.servings || 1,
          logData.calories || 0,
          logData.protein || 0,
          logData.carbs || 0,
          logData.fat || 0,
          logData.sugar || null,
          logData.fiber || null,
          logData.saturatedFat || null,
          logData.sodium || null,
          logData.healthScore || null,
          logData.novagroup || null,
          logData.nutriscoreGrade || null,
          logData.healthTags || [],
          logData.additives || [],
          now,
        ]
      );

      // Update daily totals
      await neonQuery(
        `UPDATE "DailyNutrition" SET
          "caloriesConsumed" = "caloriesConsumed" + $1,
          "proteinConsumed" = "proteinConsumed" + $2,
          "carbsConsumed" = "carbsConsumed" + $3,
          "fatConsumed" = "fatConsumed" + $4,
          "updatedAt" = NOW()
        WHERE "userId" = $5 AND "date" = $6`,
        [logData.calories || 0, logData.protein || 0, logData.carbs || 0, logData.fat || 0, userId, logData.date]
      );

      const r = (insertRows && insertRows[0]) || {};
      return {
        id: r.id || id,
        userId: r.userId || userId,
        date: r.date || logData.date,
        mealType: r.mealType || logData.mealType,
        productBarcode: r.productBarcode || logData.productBarcode || undefined,
        productName: r.productName || logData.productName,
        brand: r.brand || logData.brand || undefined,
        imageUrl: r.imageUrl || logData.imageUrl || undefined,
        servingSize: r.servingSize || logData.servingSize || undefined,
        grams: r.grams || logData.grams,
        servings: r.servings || logData.servings,
        calories: r.calories || logData.calories,
        protein: r.protein || logData.protein,
        carbs: r.carbs || logData.carbs,
        fat: r.fat || logData.fat,
        sugar: r.sugar ?? logData.sugar ?? undefined,
        fiber: r.fiber ?? logData.fiber ?? undefined,
        saturatedFat: r.saturatedFat ?? logData.saturatedFat ?? undefined,
        sodium: r.sodium ?? logData.sodium ?? undefined,
        healthScore: r.healthScore ?? logData.healthScore ?? undefined,
        novagroup: r.novagroup ?? logData.novagroup ?? undefined,
        nutriscoreGrade: r.nutriscoreGrade || logData.nutriscoreGrade || undefined,
        healthTags: this.safeArray(r.healthTags || logData.healthTags),
        additives: this.safeArray(r.additives || logData.additives),
        createdAt: this.safeDateIso(r.createdAt),
      };
    }

    const id = `fl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const log: DbFoodLog = {
      ...logData,
      id,
      userId,
      createdAt: now,
    };
    this.foodLogs.set(id, log);

    // Update in-memory daily nutrition
    const daily = await this.getDailyNutrition(userId, logData.date);
    daily.caloriesConsumed += logData.calories;
    daily.proteinConsumed += logData.protein;
    daily.carbsConsumed += logData.carbs;
    daily.fatConsumed += logData.fat;
    daily.updatedAt = now;

    return log;
  }

  async deleteFoodLog(logId: string, userId: string): Promise<boolean> {
    if (process.env.DATABASE_URL) {
      const rows = await neonQuery('SELECT * FROM "FoodLog" WHERE id = $1 AND "userId" = $2', [logId, userId]);
      if (!rows || rows.length === 0) return false;
      const log = rows[0];

      await neonQuery('DELETE FROM "FoodLog" WHERE id = $1', [logId]);

      // Deduct from daily totals
      await neonQuery(
        `UPDATE "DailyNutrition" SET
          "caloriesConsumed" = GREATEST(0, "caloriesConsumed" - $1),
          "proteinConsumed" = GREATEST(0, "proteinConsumed" - $2),
          "carbsConsumed" = GREATEST(0, "carbsConsumed" - $3),
          "fatConsumed" = GREATEST(0, "fatConsumed" - $4),
          "updatedAt" = NOW()
        WHERE "userId" = $5 AND "date" = $6`,
        [log.calories || 0, log.protein || 0, log.carbs || 0, log.fat || 0, userId, log.date]
      );
      return true;
    }

    const log = this.foodLogs.get(logId);
    if (log && log.userId === userId) {
      this.foodLogs.delete(logId);
      const daily = await this.getDailyNutrition(userId, log.date);
      daily.caloriesConsumed = Math.max(0, daily.caloriesConsumed - log.calories);
      daily.proteinConsumed = Math.max(0, daily.proteinConsumed - log.protein);
      daily.carbsConsumed = Math.max(0, daily.carbsConsumed - log.carbs);
      daily.fatConsumed = Math.max(0, daily.fatConsumed - log.fat);
      return true;
    }
    return false;
  }

  // Scan History Operations
  async getScanHistory(userId: string): Promise<DbScanHistory[]> {
    if (process.env.DATABASE_URL) {
      const rows = await neonQuery(
        'SELECT * FROM "ScanHistory" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50',
        [userId]
      );
      if (!rows) return [];
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        barcode: r.barcode,
        productName: r.productName,
        brand: r.brand || undefined,
        imageUrl: r.imageUrl || undefined,
        nutriscoreGrade: r.nutriscoreGrade || undefined,
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fat: r.fat,
        healthScore: r.healthScore ?? undefined,
        verdict: r.verdict,
        productJson: r.productJson || undefined,
        scannedAt: this.safeDateIso(r.createdAt),
        createdAt: this.safeDateIso(r.createdAt),
      }));
    }

    return Array.from(this.scanHistories.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addScanHistory(userId: string, scanData: Omit<DbScanHistory, 'id' | 'userId' | 'createdAt'>): Promise<DbScanHistory> {
    if (process.env.DATABASE_URL) {
      const id = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date();

      const insertRows = await neonQuery(
        `INSERT INTO "ScanHistory" (
          "id", "userId", "barcode", "productName", "brand", "imageUrl",
          "nutriscoreGrade", "calories", "protein", "carbs", "fat",
          "healthScore", "verdict", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          id,
          userId,
          scanData.barcode,
          scanData.productName,
          scanData.brand || null,
          scanData.imageUrl || null,
          scanData.nutriscoreGrade || null,
          scanData.calories || 0,
          scanData.protein || 0,
          scanData.carbs || 0,
          scanData.fat || 0,
          scanData.healthScore || null,
          scanData.verdict || 'Scanned',
          now,
        ]
      );

      const r = (insertRows && insertRows[0]) || {};
      return {
        id: r.id || id,
        userId: r.userId || userId,
        barcode: r.barcode || scanData.barcode,
        productName: r.productName || scanData.productName,
        brand: r.brand || scanData.brand || undefined,
        imageUrl: r.imageUrl || scanData.imageUrl || undefined,
        nutriscoreGrade: r.nutriscoreGrade || scanData.nutriscoreGrade || undefined,
        calories: r.calories || scanData.calories,
        protein: r.protein || scanData.protein,
        carbs: r.carbs || scanData.carbs,
        fat: r.fat || scanData.fat,
        healthScore: r.healthScore ?? scanData.healthScore ?? undefined,
        verdict: r.verdict || scanData.verdict,
        productJson: r.productJson || scanData.productJson || undefined,
        scannedAt: this.safeDateIso(r.createdAt),
        createdAt: this.safeDateIso(r.createdAt),
      };
    }

    const id = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const scan: DbScanHistory = {
      ...scanData,
      id,
      userId,
      scannedAt: now,
      createdAt: now,
    };
    this.scanHistories.set(id, scan);
    return scan;
  }

  // Workout History Operations
  async getWorkoutHistory(userId: string): Promise<DbWorkoutHistory[]> {
    if (process.env.DATABASE_URL) {
      const rows = await neonQuery(
        'SELECT * FROM "WorkoutHistory" WHERE "userId" = $1 ORDER BY "completedAt" DESC LIMIT 50',
        [userId]
      );
      if (!rows) return [];
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        routineName: r.routineName,
        category: r.category,
        durationMinutes: r.durationMinutes,
        caloriesBurned: r.caloriesBurned,
        completedAt: this.safeDateIso(r.completedAt),
        createdAt: this.safeDateIso(r.createdAt),
      }));
    }

    return Array.from(this.workoutHistories.values())
      .filter((w) => w.userId === userId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  async addWorkoutHistory(userId: string, workoutData: Omit<DbWorkoutHistory, 'id' | 'userId' | 'createdAt'>): Promise<DbWorkoutHistory> {
    if (process.env.DATABASE_URL) {
      const id = `work_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date();
      const completedAt = workoutData.completedAt ? new Date(workoutData.completedAt) : now;

      const insertRows = await neonQuery(
        `INSERT INTO "WorkoutHistory" (
          "id", "userId", "routineName", "category", "durationMinutes",
          "caloriesBurned", "completedAt", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          id,
          userId,
          workoutData.routineName,
          workoutData.category,
          workoutData.durationMinutes || 30,
          workoutData.caloriesBurned || 150,
          completedAt,
          now,
        ]
      );

      const r = (insertRows && insertRows[0]) || {};
      return {
        id: r.id || id,
        userId: r.userId || userId,
        routineName: r.routineName || workoutData.routineName,
        category: r.category || workoutData.category,
        durationMinutes: r.durationMinutes || workoutData.durationMinutes,
        caloriesBurned: r.caloriesBurned || workoutData.caloriesBurned,
        completedAt: this.safeDateIso(r.completedAt),
        createdAt: this.safeDateIso(r.createdAt),
      };
    }

    const id = `work_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const workout: DbWorkoutHistory = {
      ...workoutData,
      id,
      userId,
      createdAt: now,
    };
    this.workoutHistories.set(id, workout);
    return workout;
  }
}

export const dbStore = new DbStore();
