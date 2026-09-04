import { z } from "zod";

export const createFoodLogSchema = z.object({
  name: z.string().min(1, "Food name is required").max(200).optional(),
  productName: z.string().min(1).max(200).optional(),
  mealType: z.string().min(1).optional(),
  sectionId: z.enum(["breakfast","lunch","snack","dinner","drinks","Breakfast","Lunch","Snack","Dinner","Drinks"]).optional(),
  productBarcode: z.string().max(50).optional(),
  brand: z.string().max(100).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  servingSize: z.string().max(50).optional(),
  grams: z.number().min(0).max(5000).optional().default(100),
  servings: z.number().min(0).max(100).optional().default(1),
  calories: z.number().min(0).max(10000).optional().default(0),
  protein: z.number().min(0).max(1000).optional().default(0),
  carbs: z.number().min(0).max(1000).optional().default(0),
  fat: z.number().min(0).max(1000).optional().default(0),
  sugar: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  saturatedFat: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const updateWaterSchema = z.object({
  waterConsumed: z.number().min(0).max(20),
  water: z.number().min(0).max(20).optional(),
  amount: z.number().min(0).max(20).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const createPantryBatchSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().min(0).optional(),
  unit: z.string().max(20).optional(),
  recipeId: z.string().optional(),
});
