export type VeyMood =
  | "idle"
  | "happy"
  | "celebrate"
  | "concerned"
  | "warn"
  | "hydrated"
  | "hungry"
  | "coaching"
  | "focused"
  | "cheer"
  | "wave"
  | "think"
  | "wink"
  | "zen"

export type VeyAccent = "aqua" | "mint" | "coral" | "violet"

export type Screen =
  | "dashboard"
  | "discover"
  | "scanner"
  | "log"
  | "fitness"
  | "coach"
  | "ai"
  | "profile"

export interface UserProfile {
  name: string
  email: string
  age: number
  heightCm: number
  weightKg: number
  targetWeightKg: number
  goal: "Lose Weight" | "Build Muscle" | "Maintain Weight" | "Improve Fitness"
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very"
  dailyCalories: number
  dailyProtein: number
  dailyCarbs: number
  dailyFat: number
  dailyWater: number
  dietaryPreferences: string[]
  favoriteCuisines: string[]
  allergens: string[]
  units: "metric" | "imperial"
  theme: "dark" | "light" | "system"
  notifications: {
    aiInsights: boolean
    mealReminders: boolean
    workoutReminders: boolean
    hydrationReminders: boolean
    weeklyReport: boolean
  }
  aiProactiveFrequency: "high" | "medium" | "low"
}

export interface ProductMicronutrients {
  calcium?: number
  iron?: number
  magnesium?: number
  potassium?: number
  zinc?: number
  vitaminA?: number
  vitaminC?: number
  vitaminD?: number
  vitaminB12?: number
  folate?: number
  [key: string]: number | undefined
}

export interface ProductNutrition {
  calories?: number
  protein?: number
  carbohydrates?: number
  sugars?: number
  fat?: number
  saturatedFat?: number
  fiber?: number
  sodium?: number
  salt?: number
}

export interface RobotoffInsight {
  type: string
  value: string
  confidence?: number
}

export interface Product {
  barcode: string
  name: string
  genericName?: string
  brand?: string
  imageUrl?: string
  frontImageUrl?: string
  servingSize?: string

  nutrition: ProductNutrition
  micronutrients?: ProductMicronutrients

  ingredients?: string[]
  allergens?: string[]
  categories?: string[]
  countries?: string[]

  nutriScore?: "A" | "B" | "C" | "D" | "E" | "a" | "b" | "c" | "d" | "e"
  novaGroup?: 1 | 2 | 3 | 4
  labels?: string[]
  robotoffInsights?: RobotoffInsight[]
}

export interface FoodItem {
  id: string | number
  name: string
  brand?: string
  genericName?: string
  cuisine?: string
  category: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Main Meals" | "Desserts" | "Drinks" | "Vegan" | "Vegetarian"
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar?: number
  saturatedFat?: number
  fiber?: number
  sodium?: number
  salt?: number
  portionGrams: number
  servingSize?: string
  timeToPrepareMin?: number
  score: number // Health score out of 10
  nutriScore?: "A" | "B" | "C" | "D" | "E"
  novaGroup?: 1 | 2 | 3 | 4
  dietaryFlags?: string[]
  ingredients?: string[]
  allergens?: string[]
  categories?: string[]
  countries?: string[]
  labels?: string[]
  recipeSteps?: string[]
  warnings?: string[]
  img: string
  tag?: string
  barcode?: string
  aiRecommendation?: string
  micronutrients?: ProductMicronutrients
  robotoffInsights?: RobotoffInsight[]
  product?: Product
}

export interface LoggedMealEntry {
  id: string
  foodId: string | number
  name: string
  sectionId: "breakfast" | "lunch" | "snack" | "dinner" | "drinks"
  servings: number
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
  img: string
}

export interface ProductComparison {
  productA: FoodItem | null
  productB: FoodItem | null
}

export interface Exercise {
  id: string
  name: string
  durationSec?: number
  reps?: number
  sets?: number
  restSec: number
  instructions: string
  muscles: string
}

export interface WorkoutRoutine {
  id: string
  name: string
  category: "Weight Loss" | "Muscle Building" | "Cardio" | "Beginner" | "Home Workout" | "Gym" | "Mobility"
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  targetGender?: "All" | "Male" | "Female"
  durationMin: number
  caloriesBurned: number
  muscles: string
  equipment: string
  img: string
  description: string
  tag?: string
  exercises: Exercise[]
}

export interface ChatMessageCard {
  type: "food" | "workout" | "nutrition" | "action"
  title: string
  subtitle: string
  value: string
  color: string
  actionLabel?: string
  actionType?: "add_food" | "start_workout" | "log_water" | "view_recipe" | "open_screen"
  payload?: any
}

export interface ChatMessage {
  id: string | number
  role: "user" | "ai"
  text: string
  cards?: ChatMessageCard[]
  timestamp: string
}

export interface ToastAlert {
  id: string
  message: string
  type?: "success" | "info" | "warning"
  icon?: string
}
