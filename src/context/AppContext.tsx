import React, { createContext, useContext, useState, useEffect } from "react"
import {
  Screen,
  UserProfile,
  LoggedMealEntry,
  FoodItem,
  WorkoutRoutine,
  ChatMessage,
  VeyMood,
  ToastAlert,
  ProductComparison,
  PantryItem,
  ShoppingListItem,
  WeeklyMealPlan,
  WeightRecord,
} from "@/types"

import { searchProducts, getProductByBarcode, ApiProduct } from "@/services/api/productService"
import { filterMeals, searchMeals, ApiMeal } from "@/services/api/mealService"
import {
  loadUserFromStorage,
  saveUserToStorage,
  loadMealLogsFromStorage,
  saveMealLogsToStorage,
  loadOnboardingCompleted,
  saveOnboardingCompleted,
  loadAuthState,
  saveAuthState,
  loadRegisteredAccounts,
  saveRegisteredAccounts,
  StoredUserAccount,
  performOneTimeDataMigration,
} from "@/services/storage/userStorage"
import { VeyraApiClient } from "@/services/api/veyraApi"
import { calculateUserTargets, getCoachMessage, assessProductRisk } from "@/utils/healthAdvisor"
import { buildVeyraUserContext } from "@/services/ai/aiContext"
import { VeyraAIService } from "@/services/ai/aiService"

export const SAMPLE_PRODUCTS: FoodItem[] = [
  {
    id: "prod-1",
    name: "Nutella Hazelnut Spread",
    brand: "Ferrero",
    category: "Desserts",
    calories: 539,
    protein: 6.3,
    carbs: 57.5,
    fat: 30.9,
    sugar: 56.3,
    fiber: 3.4,
    salt: 0.1,
    portionGrams: 30,
    score: 3.2,
    nutriScore: "E",
    dietaryFlags: ["Vegetarian"],
    ingredients: ["Sugar", "Palm Oil", "Hazelnuts (13%)", "Skimmed Milk Powder (8.7%)", "Fat-Reduced Cocoa (7.4%)", "Lecithin (Soy)", "Vanillin"],
    warnings: ["High Sugar", "High Saturated Fat", "Ultra Processed"],
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&auto=format",
    barcode: "3017620422003",
    aiRecommendation: "High in sugar (56g/100g). Swap for almond butter or limit to 1 tsp for your calorie budget.",
  },
  {
    id: "prod-2",
    name: "Coca-Cola Zero Sugar",
    brand: "Coca-Cola",
    category: "Drinks",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
    fiber: 0,
    salt: 0.02,
    portionGrams: 330,
    score: 6.5,
    nutriScore: "B",
    dietaryFlags: ["Vegan", "Zero Calorie", "Keto"],
    ingredients: ["Carbonated Water", "Caramel Color", "Phosphoric Acid", "Sweeteners (Aspartame, Acesulfame K)", "Natural Flavors", "Caffeine"],
    warnings: ["Artificial Sweeteners"],
    img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop&auto=format",
    barcode: "5449000000996",
    aiRecommendation: "Zero calorie option that fits your calorie deficit. Enjoy in moderation.",
  },
  {
    id: "prod-3",
    name: "Fage Total 0% Greek Yogurt",
    brand: "Fage",
    category: "Snack",
    calories: 54,
    protein: 10.3,
    carbs: 3.0,
    fat: 0,
    sugar: 3.0,
    fiber: 0,
    salt: 0.1,
    portionGrams: 170,
    score: 9.6,
    nutriScore: "A",
    dietaryFlags: ["High Protein", "Low Fat", "Keto-friendly"],
    ingredients: ["Pasteurized Skimmed Milk", "Live Active Yogurt Cultures"],
    warnings: [],
    img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format",
    barcode: "5201051000028",
    aiRecommendation: "Excellent choice! 17g protein per serving with 0g fat. Ideal for your protein target today.",
  },
  {
    id: "prod-4",
    name: "Oatly Barista Edition Oat Milk",
    brand: "Oatly",
    category: "Drinks",
    calories: 59,
    protein: 1.1,
    carbs: 6.6,
    fat: 3.0,
    sugar: 3.4,
    fiber: 0.8,
    salt: 0.1,
    portionGrams: 200,
    score: 8.4,
    nutriScore: "B",
    dietaryFlags: ["Vegan", "Dairy Free"],
    ingredients: ["Oat Base (Water, Oats 10%)", "Rapeseed Oil", "Dipotassium Phosphate", "Calcium Carbonate", "Sea Salt", "Vitamins (D2, Riboflavin, B12)"],
    warnings: [],
    img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&auto=format",
    barcode: "7350033400010",
    aiRecommendation: "Great plant-based dairy alternative. Fortified with Vitamin D and B12.",
  },
  {
    id: "prod-5",
    name: "Grilled Chicken Breast Bowl",
    brand: "Veyra Kitchen",
    category: "Lunch",
    calories: 420,
    protein: 42,
    carbs: 18,
    fat: 16,
    sugar: 2.1,
    fiber: 5.2,
    salt: 0.8,
    portionGrams: 320,
    score: 9.4,
    nutriScore: "A",
    dietaryFlags: ["High Protein", "Balanced"],
    ingredients: ["Grilled Chicken Breast", "Mixed Salad Greens", "Quinoa", "Cherry Tomatoes", "Olive Oil Dressing"],
    warnings: [],
    img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&auto=format",
    barcode: "8901234567890",
    aiRecommendation: "Top goal match! Provides 32% of your daily protein in one clean meal.",
  },
]

export const SAMPLE_WORKOUTS: WorkoutRoutine[] = [
  {
    id: "wo-1",
    name: "HIIT Fat Burner",
    category: "Weight Loss",
    difficulty: "Intermediate",
    targetGender: "All",
    durationMin: 25,
    caloriesBurned: 380,
    muscles: "Full Body",
    equipment: "Bodyweight",
    img: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&h=300&fit=crop&auto=format",
    description: "High-energy interval circuit designed to burn calories and accelerate fat loss.",
    tag: "Recommended",
    exercises: [
      { id: "e1", name: "Jumping Jacks", durationSec: 45, restSec: 15, instructions: "Keep arms straight and land softly on feet.", muscles: "Cardio & Legs" },
      { id: "e2", name: "Bodyweight Squats", reps: 15, restSec: 20, instructions: "Keep chest up and push through heels.", muscles: "Quads & Glutes" },
      { id: "e3", name: "Mountain Climbers", durationSec: 40, restSec: 20, instructions: "Drive knees toward chest rapidly in plank position.", muscles: "Core & Shoulders" },
      { id: "e4", name: "Push-ups", reps: 12, restSec: 30, instructions: "Lower chest to ground while maintaining flat torso.", muscles: "Chest & Triceps" },
      { id: "e5", name: "Burpees", reps: 10, restSec: 30, instructions: "Explode up with energy on each rep.", muscles: "Full Body" },
    ],
  },
  {
    id: "wo-2",
    name: "Upper Body Hypertrophy",
    category: "Muscle Building",
    difficulty: "Intermediate",
    targetGender: "Male",
    durationMin: 40,
    caloriesBurned: 320,
    muscles: "Chest, Back, Arms",
    equipment: "Dumbbells",
    img: "https://images.unsplash.com/photo-1641337221253-fdc7237f6b61?w=500&h=300&fit=crop&auto=format",
    description: "Targeted resistance workout to build chest, back, and arm definition.",
    tag: "Popular",
    exercises: [
      { id: "e20", name: "Dumbbell Bench Press", reps: 12, sets: 3, restSec: 45, instructions: "Press weights vertically and squeeze chest.", muscles: "Chest" },
      { id: "e21", name: "Bent-Over Rows", reps: 12, sets: 3, restSec: 45, instructions: "Pull dumbbells to hips with flat back.", muscles: "Back" },
      { id: "e22", name: "Bicep Curls", reps: 15, sets: 3, restSec: 30, instructions: "Control movement without swinging elbows.", muscles: "Biceps" },
      { id: "e23", name: "Tricep Overhead Extension", reps: 12, sets: 3, restSec: 30, instructions: "Extend dumbbell overhead fully.", muscles: "Triceps" },
    ],
  },
]

interface AppContextType {
  screen: Screen
  setScreen: (s: Screen) => void

  // Onboarding & Auth State
  onboardingCompleted: boolean
  completeOnboarding: () => void
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (data: { firstName: string; lastName: string; email: string; password: string; goal: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => void

  user: UserProfile
  updateUser: (fields: Partial<UserProfile>) => void

  meals: LoggedMealEntry[]
  addMeal: (entry: Omit<LoggedMealEntry, "id">) => void
  removeMeal: (id: string) => void
  updateMealQuantity: (id: string, grams: number, servings: number) => void

  waterLiters: number
  addWater: (amountL: number) => void
  resetWater: () => void

  favorites: Set<string | number>
  toggleFavorite: (id: string | number) => void

  // New Persistent Features
  pantryItems: PantryItem[]
  addPantryItem: (item: { name: string; quantity: number; unit: string; expirationDate?: string }) => Promise<void>
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => Promise<void>
  deletePantryItem: (id: string) => Promise<void>

  shoppingList: ShoppingListItem[]
  addShoppingListItem: (item: { name: string; quantity: number; unit: string; recipeId?: string }) => Promise<void>
  addBatchShoppingList: (items: Array<{ name: string; quantity: number; unit: string; recipeId?: string }>) => Promise<void>
  updateShoppingListItem: (id: string, updates: Partial<ShoppingListItem>) => Promise<void>
  deleteShoppingListItem: (id: string) => Promise<void>
  clearPurchasedShoppingList: () => Promise<void>
  clearEntireShoppingList: () => Promise<void>

  mealPlan: WeeklyMealPlan | null
  getMealPlanApi: (weekStartDate: string) => Promise<any>
  saveMealPlanApi: (weekStartDate: string, plan: any) => Promise<any>
  generateMealPlanApi: (weekStartDate: string) => Promise<any>

  weightHistory: WeightRecord[]
  addWeightEntry: (weight: number, date?: string) => Promise<void>

  scannedProduct: FoodItem | null
  setScannedProduct: (item: FoodItem | null) => void
  comparison: ProductComparison
  setComparison: (comp: ProductComparison) => void

  // Real API methods
  lookupBarcodeApi: (barcode: string) => Promise<FoodItem | null>
  searchProductsApi: (query: string) => Promise<FoodItem[]>
  searchMealsApi: (query: string) => Promise<ApiMeal[]>

  activeWorkout: WorkoutRoutine | null
  setActiveWorkout: (w: WorkoutRoutine | null) => void
  completeWorkout: (w: WorkoutRoutine) => void
  completedWorkoutsCount: number

  chatMessages: ChatMessage[]
  sendMessage: (text: string) => void
  isAiTyping: boolean

  mascotMood: VeyMood
  setMascotMood: (mood: VeyMood) => void
  triggerCelebration: (message?: string) => void
  showConfetti: boolean

  toasts: ToastAlert[]
  addToast: (message: string, type?: "success" | "info" | "warning") => void
  removeToast: (id: string) => void

  selectedFoodForModal: FoodItem | null
  setSelectedFoodForModal: (food: FoodItem | null) => void
}


const initialUser: UserProfile = {
  name: "Veyra Member",
  email: "member@veyra.app",
  age: 28,
  heightCm: 178,
  weightKg: 80,
  targetWeightKg: 75,
  goal: "Lose Weight",
  activityLevel: "moderate",
  dailyCalories: 2100,
  dailyProtein: 130,
  dailyCarbs: 240,
  dailyFat: 70,
  dailyWater: 2.5,
  dietaryPreferences: ["Mediterranean", "High Protein"],
  favoriteCuisines: ["Mediterranean", "Italian"],
  allergens: [],
  units: "metric",
  theme: "light",
  notifications: {
    aiInsights: true,
    mealReminders: true,
    workoutReminders: true,
    hydrationReminders: true,
    weeklyReport: true,
  },
  aiProactiveFrequency: "high",
}

const initialMeals: LoggedMealEntry[] = [
  {
    id: "m-1",
    foodId: "3",
    name: "Oatmeal with Blueberries",
    sectionId: "breakfast",
    servings: 1,
    grams: 180,
    calories: 280,
    protein: 10,
    carbs: 48,
    fat: 5,
    time: "8:10 AM",
    img: "https://images.unsplash.com/photo-1501959915551-4e8d30928317?w=80&h=80&fit=crop&auto=format",
  },
  {
    id: "m-2",
    foodId: "prod-5",
    name: "Grilled Chicken Salad",
    sectionId: "lunch",
    servings: 1,
    grams: 320,
    calories: 520,
    protein: 42,
    carbs: 18,
    fat: 16,
    time: "1:05 PM",
    img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=80&h=80&fit=crop&auto=format",
  },
]

const initialChat: ChatMessage[] = [
  {
    id: "c-1",
    role: "ai",
    text: "Hi! I'm Veyra, your personal AI wellness companion. I'm connected live to your nutrition engine, barcode scanner, and fitness goals. How can I guide you today?",
    timestamp: "Just now",
  },
]

export function mapApiProductToFoodItem(prod: ApiProduct): FoodItem {
  const n = prod.nutrients || {}
  const raw = prod.rawProduct

  const nutriScoreRaw = (prod.nutritionGrade || "").toUpperCase()
  const nutriScore = ["A", "B", "C", "D", "E"].includes(nutriScoreRaw) ? (nutriScoreRaw as any) : undefined
  const novaGroup = [1, 2, 3, 4].includes(Number(prod.novaGroup)) ? (Number(prod.novaGroup) as any) : undefined

  return {
    id: prod.barcode || `prod-${Date.now()}`,
    name: prod.name || "Food Product",
    brand: prod.brand || "Verified Brand",
    genericName: prod.genericName || raw?.genericName,
    category: "Snack",
    calories: n.calories !== undefined ? Math.round(n.calories) : 0,
    protein: n.protein !== undefined ? Number(n.protein.toFixed(1)) : 0,
    carbs: n.carbs !== undefined ? Number(n.carbs.toFixed(1)) : 0,
    fat: n.fat !== undefined ? Number(n.fat.toFixed(1)) : 0,
    sugar: n.sugar !== undefined ? Number(n.sugar.toFixed(1)) : undefined,
    saturatedFat: n.saturatedFat !== undefined ? Number(n.saturatedFat.toFixed(1)) : undefined,
    fiber: n.fiber !== undefined ? Number(n.fiber.toFixed(1)) : undefined,
    sodium: n.sodium !== undefined ? Number(n.sodium.toFixed(3)) : undefined,
    salt: n.salt !== undefined ? Number(n.salt.toFixed(2)) : undefined,
    portionGrams: 100,
    servingSize: prod.servingSize || raw?.servingSize,
    score: nutriScore === "A" ? 9.5 : nutriScore === "B" ? 8.2 : nutriScore === "C" ? 6.5 : nutriScore === "D" ? 5.0 : 4.0,
    nutriScore,
    novaGroup,
    dietaryFlags: prod.allergens ? prod.allergens.split(",").map((a) => a.trim()) : ["Verified Product"],
    ingredients: prod.ingredients ? prod.ingredients.split(",").map((i) => i.trim()).filter(Boolean) : raw?.ingredients,
    allergens: prod.allergens ? prod.allergens.split(",").map((a) => a.trim()) : raw?.allergens,
    categories: prod.categories || raw?.categories,
    countries: prod.countries || raw?.countries,
    labels: prod.labels || raw?.labels,
    warnings: (n.sugar && n.sugar > 12) ? ["High Sugar"] : (n.sodium && n.sodium > 0.8) ? ["High Sodium"] : [],
    img: prod.image || prod.frontImageUrl || raw?.imageUrl || "",
    barcode: prod.barcode,
    aiRecommendation: `Product analysis for ${prod.brand || "brand"}. Nutri-Score ${nutriScore || "N/A"}.`,
    micronutrients: prod.micronutrients || raw?.micronutrients,
    robotoffInsights: prod.robotoffInsights || raw?.robotoffInsights,
    product: raw,
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>("dashboard")
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => loadOnboardingCompleted())
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadAuthState())

  const [user, setUser] = useState<UserProfile>(() => loadUserFromStorage(initialUser))
  const [meals, setMeals] = useState<LoggedMealEntry[]>(() => loadMealLogsFromStorage(initialMeals))
  const [waterLiters, setWaterLiters] = useState<number>(1.8)
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set(["prod-3", 1, 2]))

  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null)
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([])

  const [scannedProduct, setScannedProduct] = useState<FoodItem | null>(null)
  const [comparison, setComparison] = useState<ProductComparison>({ productA: null, productB: null })

  const [activeWorkout, setActiveWorkout] = useState<WorkoutRoutine | null>(null)
  const [completedWorkoutsCount, setCompletedWorkoutsCount] = useState<number>(2)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChat)
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false)
  const [mascotMood, setMascotMood] = useState<VeyMood>("happy")
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [toasts, setToasts] = useState<ToastAlert[]>([])

  const [selectedFoodForModal, setSelectedFoodForModal] = useState<FoodItem | null>(null)

  // Sync Cloud Database state on mount & login
  useEffect(() => {
    if (isAuthenticated) {
      VeyraApiClient.getPantry().then((data) => { if (Array.isArray(data)) setPantryItems(data) }).catch(() => {})
      VeyraApiClient.getShoppingList().then((data) => { if (Array.isArray(data)) setShoppingList(data) }).catch(() => {})
      VeyraApiClient.getWeightHistory().then((data) => { if (Array.isArray(data)) setWeightHistory(data) }).catch(() => {})
      VeyraApiClient.getFavorites().then((favs) => {
        if (Array.isArray(favs)) {
          setFavorites(new Set(favs.map((f: any) => f.recipeId)))
        }
      }).catch(() => {})
    }
  }, [isAuthenticated])

  const completeOnboarding = () => {
    setOnboardingCompleted(true)
    saveOnboardingCompleted(true)
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: "Please enter your email and password." };
    }

    try {
      const res = await VeyraApiClient.login(cleanEmail, password);
      if (res.success && res.user) {
        setUser(res.user);
        saveUserToStorage(res.user);
        setIsAuthenticated(true);
        saveAuthState(true);

        try {
          const { logs } = await VeyraApiClient.getFoodLog();
          if (logs && logs.length > 0) {
            setMeals(logs);
          }
          const pData = await VeyraApiClient.getPantry();
          if (Array.isArray(pData)) setPantryItems(pData);
          const sData = await VeyraApiClient.getShoppingList();
          if (Array.isArray(sData)) setShoppingList(sData);
          const wData = await VeyraApiClient.getWeightHistory();
          if (Array.isArray(wData)) setWeightHistory(wData);
        } catch (e) {
          // ignore fetching initial log
        }

        addToast(`Welcome back, ${res.user.name.split(' ')[0]}!`, "success");
        return { success: true };
      }
      return { success: false, error: res.error || "Invalid email or password." };
    } catch (err: any) {
      return { success: false, error: err.message || "Invalid email or password." };
    }
  }

  const signup = async (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    goal: string
  }): Promise<{ success: boolean; error?: string }> => {
    if (!data.firstName.trim() || !data.email.trim() || !data.password) {
      return { success: false, error: "Please fill out all required fields." };
    }
    if (data.password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    try {
      const res = await VeyraApiClient.signup(data);
      if (res.success && res.user) {
        setUser(res.user);
        saveUserToStorage(res.user);
        setIsAuthenticated(true);
        saveAuthState(true);
        addToast(`Account created! Welcome to Veyra, ${data.firstName.trim()}!`, "success");
        return { success: true };
      }
      return { success: false, error: res.error || "An account with this email already exists." };
    } catch (err: any) {
      return { success: false, error: err.message || "Registration failed." };
    }
  }

  const logout = () => {
    setIsAuthenticated(false);
    saveAuthState(false);
    addToast("Logged out successfully", "info");
  }

  // Save changes to storage & sync backend
  useEffect(() => {
    saveUserToStorage(user);
    performOneTimeDataMigration(user);
  }, [user]);

  useEffect(() => {
    saveMealLogsToStorage(meals);
  }, [meals]);

  // Persistent Domain Handlers
  const addPantryItem = async (item: { name: string; quantity: number; unit: string; expirationDate?: string }) => {
    const res = await VeyraApiClient.addPantryItem(item);
    if (res) {
      setPantryItems((prev) => [res, ...prev]);
    }
  }

  const updatePantryItem = async (id: string, updates: Partial<PantryItem>) => {
    const res = await VeyraApiClient.updatePantryItem(id, updates);
    if (res) {
      setPantryItems((prev) => prev.map((p) => (p.id === id ? res : p)));
    }
  }

  const deletePantryItem = async (id: string) => {
    const ok = await VeyraApiClient.deletePantryItem(id);
    if (ok) {
      setPantryItems((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const addShoppingListItem = async (item: { name: string; quantity: number; unit: string; recipeId?: string }) => {
    const res = await VeyraApiClient.addShoppingListItem(item);
    if (res) {
      setShoppingList((prev) => [res, ...prev]);
    }
  }

  const addBatchShoppingList = async (items: Array<{ name: string; quantity: number; unit: string; recipeId?: string }>) => {
    const res = await VeyraApiClient.addBatchShoppingList(items);
    if (Array.isArray(res)) {
      setShoppingList((prev) => [...res, ...prev]);
    }
  }

  const updateShoppingListItem = async (id: string, updates: Partial<ShoppingListItem>) => {
    const res = await VeyraApiClient.updateShoppingListItem(id, updates);
    if (res) {
      setShoppingList((prev) => prev.map((s) => (s.id === id ? res : s)));
    }
  }

  const deleteShoppingListItem = async (id: string) => {
    const ok = await VeyraApiClient.deleteShoppingListItem(id);
    if (ok) {
      setShoppingList((prev) => prev.filter((s) => s.id !== id));
    }
  }

  const clearPurchasedShoppingList = async () => {
    const ok = await VeyraApiClient.clearPurchasedShoppingList();
    if (ok) {
      setShoppingList((prev) => prev.filter((s) => !s.isPurchased));
    }
  }

  const clearEntireShoppingList = async () => {
    const ok = await VeyraApiClient.clearEntireShoppingList();
    if (ok) {
      setShoppingList([]);
    }
  }

  const getMealPlanApi = async (weekStartDate: string) => {
    return await VeyraApiClient.getMealPlan(weekStartDate);
  }

  const saveMealPlanApi = async (weekStartDate: string, plan: any) => {
    return await VeyraApiClient.saveMealPlan(weekStartDate, plan);
  }

  const generateMealPlanApi = async (weekStartDate: string) => {
    return await VeyraApiClient.generateMealPlan(weekStartDate);
  }

  const addWeightEntry = async (weight: number, date?: string) => {
    const res = await VeyraApiClient.addWeightEntry(weight, date);
    if (res) {
      setWeightHistory((prev) => [...prev, res]);
      setUser((prev) => ({ ...prev, weightKg: weight }));
    }
  }

  // Reactive mascot moods
  useEffect(() => {
    const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const proteinLeft = user.dailyProtein - totalProtein;

    if (showConfetti) return;

    if (waterLiters >= user.dailyWater) {
      setMascotMood("hydrated");
    } else if (totalCalories > user.dailyCalories + 150) {
      setMascotMood("concerned");
    } else if (proteinLeft > 40 && totalCalories > 1500) {
      setMascotMood("hungry");
    } else if (activeWorkout) {
      setMascotMood("coaching");
    } else if (screen === "ai") {
      setMascotMood("focused");
    } else {
      setMascotMood("cheer");
    }
  }, [meals, waterLiters, user, activeWorkout, screen, showConfetti]);

  const lookupBarcodeApi = async (barcode: string): Promise<FoodItem | null> => {
    try {
      const apiProd = await getProductByBarcode(barcode);
      if (apiProd) {
        const item = mapApiProductToFoodItem(apiProd);
        VeyraApiClient.addScan(item.barcode || barcode, item).catch(() => {});
        addToast(`Verified product: ${item.name}`, "success");
        return item;
      }
    } catch (err) {
      console.warn("Barcode API lookup error:", err);
      throw err;
    }
    return null;
  }

  const searchProductsApi = async (query: string): Promise<FoodItem[]> => {
    try {
      const res = await searchProducts(query);
      if (res.products && res.products.length > 0) {
        return res.products.map(mapApiProductToFoodItem);
      }
      return [];
    } catch (err) {
      console.warn("Product search API error:", err);
      throw err;
    }
  }

  const searchMealsApi = async (query: string): Promise<ApiMeal[]> => {
    try {
      return await searchMeals(query);
    } catch (err) {
      console.warn("Meal search API error:", err);
      throw err;
    }
  }

  const updateUser = (fields: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...fields };
      const targets = calculateUserTargets(next);
      const updated = {
        ...next,
        dailyCalories: targets.targetCalories,
        dailyProtein: targets.protein,
        dailyCarbs: targets.carbs,
        dailyFat: targets.fat,
      };
      VeyraApiClient.updateProfile(updated).catch(() => {});
      return updated;
    });
    addToast("Profile updated successfully", "success");
  }

  const addMeal = (entry: Omit<LoggedMealEntry, "id">) => {
    const newEntry: LoggedMealEntry = {
      ...entry,
      id: `meal-${Date.now()}`,
    };
    setMeals((prev) => [...prev, newEntry]);
    VeyraApiClient.addFoodLog(newEntry).catch(() => {});

    addToast(`Added "${entry.name}" to ${entry.sectionId}`, "success");

    const newProteinTotal = meals.reduce((sum, m) => sum + m.protein, 0) + entry.protein;
    if (newProteinTotal >= user.dailyProtein) {
      triggerCelebration("Protein goal reached! Outstanding work! 🎉");
    }
  }

  const removeMeal = (id: string) => {
    const target = meals.find((m) => m.id === id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
    VeyraApiClient.deleteFoodLog(id).catch(() => {});
    if (target) {
      addToast(`Removed "${target.name}"`, "info");
    }
  }

  const updateMealQuantity = (id: string, grams: number, servings: number) => {
    setMeals((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const ratio = grams / (item.grams || 100)
        return {
          ...item,
          grams,
          servings,
          calories: Math.round(item.calories * ratio),
          protein: Math.round(item.protein * ratio),
          carbs: Math.round(item.carbs * ratio),
          fat: Math.round(item.fat * ratio),
        }
      })
    )
    addToast("Meal portion updated", "info")
  }

  const addWater = (amountL: number) => {
    const next = Math.min(Math.round((waterLiters + amountL) * 100) / 100, user.dailyWater + 1)
    setWaterLiters(next)
    VeyraApiClient.updateWater(next).catch(() => {})
    addToast(`Logged +${Math.round(amountL * 1000)}ml water`, "success")

    if (next >= user.dailyWater && waterLiters < user.dailyWater) {
      triggerCelebration("Daily hydration goal completed! 💧")
    }
  }

  const resetWater = () => {
    setWaterLiters(0)
    VeyraApiClient.updateWater(0).catch(() => {})
    addToast("Water count reset to 0L", "info")
  }

  const toggleFavorite = (id: string | number) => {
    const idStr = String(id)
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(idStr)) {
        next.delete(idStr)
        VeyraApiClient.removeFavorite(idStr).catch(() => {})
        addToast("Removed from favorites", "info")
      } else {
        next.add(idStr)
        VeyraApiClient.addFavorite({ recipeId: idStr, recipeTitle: `Recipe ${idStr}` }).catch(() => {})
        addToast("Saved to favorites", "success")
      }
      return next
    })
  }

  const completeWorkout = (w: WorkoutRoutine) => {
    setCompletedWorkoutsCount((c) => c + 1)
    setActiveWorkout(null)
    VeyraApiClient.addWorkout(w).catch(() => {})
    triggerCelebration(`Workout completed! +${w.caloriesBurned} kcal burned 🔥`)
  }

  const triggerCelebration = (message?: string) => {
    setMascotMood("celebrate")
    setShowConfetti(true)
    if (message) addToast(message, "success")
    setTimeout(() => {
      setShowConfetti(false)
      setMascotMood("happy")
    }, 4500)
  }

  const addToast = (message: string, type: "success" | "info" | "warning" = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    setToasts((prev) => [...prev.slice(-3), { id, message, type }])
    setTimeout(() => removeToast(id), 3500)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isAiTyping) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setChatMessages((prev) => [...prev, userMsg])
    setMascotMood("think")
    setIsAiTyping(true)

    try {
      const history = chatMessages.map((m) => ({ role: m.role, text: m.text }))
      const context = buildVeyraUserContext(
        user,
        meals,
        waterLiters,
        scannedProduct,
        activeWorkout,
        pantryItems,
        shoppingList,
        weightHistory
      )

      const aiRes = await VeyraAIService.queryAI(text.trim(), context, history)

      const totalProtein = meals.reduce((s, m) => s + m.protein, 0)
      const totalCal = meals.reduce((s, m) => s + m.calories, 0)
      const calLeft = Math.max(user.dailyCalories - totalCal, 0)
      const proteinLeft = Math.max(user.dailyProtein - totalProtein, 0)

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "ai",
        text: aiRes.text,
        cards:
          aiRes.isUnavailable
            ? undefined
            : [
                {
                  type: "nutrition",
                  title: "Daily Calories Target",
                  subtitle: `${totalCal} / ${user.dailyCalories} kcal`,
                  value: `${calLeft} left`,
                  color: "#C18A5A",
                },
                {
                  type: "nutrition",
                  title: "Protein Target",
                  subtitle: `${totalProtein} / ${user.dailyProtein} g`,
                  value: `${proteinLeft}g left`,
                  color: "#315A63",
                },
              ],
        timestamp: aiRes.timestamp,
      }

      setChatMessages((prev) => [...prev, aiMsg])
      setMascotMood("happy")
    } catch (err) {
      console.warn("AI query error:", err)
      const errMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "ai",
        text: "Sorry, I couldn't reach my AI core just now. Please check your connection and try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setChatMessages((prev) => [...prev, errMsg])
      setMascotMood("happy")
    } finally {
      setIsAiTyping(false)
    }
  }

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        onboardingCompleted,
        completeOnboarding,
        isAuthenticated,
        login,
        signup,
        logout,
        user,
        updateUser,
        meals,
        addMeal,
        removeMeal,
        updateMealQuantity,
        waterLiters,
        addWater,
        resetWater,
        favorites,
        toggleFavorite,
        pantryItems,
        addPantryItem,
        updatePantryItem,
        deletePantryItem,
        shoppingList,
        addShoppingListItem,
        addBatchShoppingList,
        updateShoppingListItem,
        deleteShoppingListItem,
        clearPurchasedShoppingList,
        clearEntireShoppingList,
        mealPlan,
        getMealPlanApi,
        saveMealPlanApi,
        generateMealPlanApi,
        weightHistory,
        addWeightEntry,
        scannedProduct,
        setScannedProduct,
        comparison,
        setComparison,
        lookupBarcodeApi,
        searchProductsApi,
        searchMealsApi,
        activeWorkout,
        setActiveWorkout,
        completeWorkout,
        completedWorkoutsCount,
        chatMessages,
        sendMessage,
        isAiTyping,
        mascotMood,
        setMascotMood,
        triggerCelebration,
        showConfetti,
        toasts,
        addToast,
        removeToast,
        selectedFoodForModal,
        setSelectedFoodForModal,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

