import { UserProfile, LoggedMealEntry, FoodItem, WorkoutRoutine } from '../../types'

export interface VeyraUserContext {
  user: {
    name: string
    firstName: string
    email: string
    goal: string
    age?: number
    heightCm?: number
    weightKg?: number
    targetWeightKg?: number
    activityLevel?: string
    dietaryPreferences?: string[]
    allergens?: string[]
  }
  nutrition: {
    dailyCalories: number
    caloriesConsumed: number
    caloriesRemaining: number
    dailyProtein: number
    proteinConsumed: number
    proteinRemaining: number
    dailyCarbs: number
    carbsConsumed: number
    carbsRemaining: number
    dailyFat: number
    fatConsumed: number
    fatRemaining: number
    waterLiters: number
    waterTarget: number
  }
  recentMeals: Array<{ name: string; calories: number; protein: number; time: string }>
  scannedProduct?: { name: string; brand?: string; calories: number; protein: number; nutriScore?: string } | null
  activeWorkout?: { name: string; category: string; durationMin: number; caloriesBurned: number } | null
}

export function buildVeyraUserContext(
  user: UserProfile,
  meals: LoggedMealEntry[],
  waterLiters: number,
  scannedProduct?: FoodItem | null,
  activeWorkout?: WorkoutRoutine | null
): VeyraUserContext {
  const caloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0)
  const proteinConsumed = meals.reduce((sum, m) => sum + m.protein, 0)
  const carbsConsumed = meals.reduce((sum, m) => sum + m.carbs, 0)
  const fatConsumed = meals.reduce((sum, m) => sum + m.fat, 0)

  const firstName = user.name ? user.name.split(' ')[0] : 'Friend'

  return {
    user: {
      name: user.name,
      firstName,
      email: user.email,
      goal: user.goal,
      age: user.age,
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      targetWeightKg: user.targetWeightKg,
      activityLevel: user.activityLevel,
      dietaryPreferences: user.dietaryPreferences || [],
      allergens: user.allergens || [],
    },
    nutrition: {
      dailyCalories: user.dailyCalories,
      caloriesConsumed,
      caloriesRemaining: Math.max(0, user.dailyCalories - caloriesConsumed),
      dailyProtein: user.dailyProtein,
      proteinConsumed,
      proteinRemaining: Math.max(0, user.dailyProtein - proteinConsumed),
      dailyCarbs: user.dailyCarbs,
      carbsConsumed,
      carbsRemaining: Math.max(0, user.dailyCarbs - carbsConsumed),
      dailyFat: user.dailyFat,
      fatConsumed,
      fatRemaining: Math.max(0, user.dailyFat - fatConsumed),
      waterLiters: Math.round(waterLiters * 10) / 10,
      waterTarget: user.dailyWater,
    },
    recentMeals: meals.slice(-5).map((m) => ({
      name: m.name,
      calories: m.calories,
      protein: m.protein,
      time: m.time,
    })),
    scannedProduct: scannedProduct
      ? {
          name: scannedProduct.name,
          brand: scannedProduct.brand,
          calories: scannedProduct.calories,
          protein: scannedProduct.protein,
          nutriScore: scannedProduct.nutriScore,
        }
      : null,
    activeWorkout: activeWorkout
      ? {
          name: activeWorkout.name,
          category: activeWorkout.category,
          durationMin: activeWorkout.durationMin,
          caloriesBurned: activeWorkout.caloriesBurned,
        }
      : null,
  }
}
