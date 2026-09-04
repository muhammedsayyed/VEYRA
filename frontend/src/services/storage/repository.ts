import { UserProfile, FoodItem, LoggedMealEntry } from '../../types';
import { dbStore, DbUser } from '../backend/dbStore';

export class AppRepository {
  // Convert DbUser to UserProfile
  private mapDbUserToProfile(dbUser: DbUser): UserProfile {
    return {
      name: `${dbUser.firstName} ${dbUser.lastName}`.trim(),
      email: dbUser.email,
      goal: dbUser.wellnessGoal,
      age: dbUser.age,
      heightCm: dbUser.height,
      weightKg: dbUser.weight,
      targetWeightKg: dbUser.targetWeight,
      activityLevel: dbUser.activityLevel,
      dailyCalories: 2000,
      dailyProtein: 140,
      dailyCarbs: 220,
      dailyFat: 65,
      dailyWater: 2500,
      dietaryPreferences: dbUser.dietaryPreferences || [],
      favoriteCuisines: dbUser.favoriteFoods || [],
      allergens: dbUser.allergens || [],
      units: 'metric',
      theme: 'dark',
      notifications: {
        aiInsights: true,
        mealReminders: true,
        workoutReminders: true,
        hydrationReminders: true,
        weeklyReport: true,
      },
      aiProactiveFrequency: 'medium',
    };
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await dbStore.getUserById(userId);
    if (!user) return null;
    return this.mapDbUserToProfile(user);
  }

  async saveUserProfile(userId: string, profile: UserProfile): Promise<boolean> {
    const nameParts = profile.name.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ');

    await dbStore.updateUser(userId, {
      firstName,
      lastName,
      weight: profile.weightKg,
      targetWeight: profile.targetWeightKg,
      wellnessGoal: profile.goal,
      activityLevel: profile.activityLevel,
    });
    return true;
  }

  async getDailyNutrition(userId: string, date: string) {
    return await dbStore.getDailyNutrition(userId, date);
  }

  async getFoodLogs(userId: string, date?: string) {
    return await dbStore.getFoodLogs(userId, date);
  }

  async deleteFoodLog(userId: string, id: string): Promise<boolean> {
    return await dbStore.deleteFoodLog(id, userId);
  }

  async getScanHistory(userId: string) {
    const scans = await dbStore.getScanHistory(userId);
    return scans.map((s) => {
      let productObj: any = s.productJson;
      if (typeof s.productJson === 'string') {
        try {
          productObj = JSON.parse(s.productJson);
        } catch {
          productObj = s.productName;
        }
      }
      return {
        code: s.barcode,
        product: productObj || s.productName,
        timestamp: new Date(s.scannedAt || s.createdAt).toLocaleTimeString([], { dateStyle: 'short', timeStyle: 'short' }),
      };
    });
  }

  async saveScanHistory(userId: string, code: string, product: FoodItem): Promise<boolean> {
    await dbStore.addScanHistory(userId, {
      barcode: code,
      productName: product.name,
      brand: product.brand,
      imageUrl: product.img,
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
      healthScore: product.score,
      verdict: 'Scanned',
      productJson: JSON.stringify(product),
    });
    return true;
  }
}
