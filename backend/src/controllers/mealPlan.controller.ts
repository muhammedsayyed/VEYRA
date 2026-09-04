import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { MealPlan } from "../models/MealPlan.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function getMealPlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const week = (req.query.week as string) || (req.query.weekStartDate as string);
    if (!week) return errorResponse(res, "Missing week parameter (YYYY-MM-DD)", 400);
    const plan = await MealPlan.findOne({ userId: req.userId, weekStartDate: week });
    if (!plan) return successResponse(res, null);
    // Try to parse mealsJson for frontend convenience
    try {
      const parsed = JSON.parse(plan.mealsJson);
      return successResponse(res, { ...plan.toObject(), meals: parsed, days: parsed.days || parsed });
    } catch {
      return successResponse(res, plan);
    }
  } catch (err) { next(err); }
}

export async function saveMealPlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const week = (req.query.week as string) || (req.query.weekStartDate as string) || req.body.weekStartDate || req.body.week;
    const mealsJson = req.body.mealsJson || req.body.meals || req.body.days;
    if (!week) return errorResponse(res, "Missing week parameter", 400);
    const jsonStr = typeof mealsJson === "string" ? mealsJson : JSON.stringify(mealsJson || {});
    const plan = await MealPlan.findOneAndUpdate(
      { userId: req.userId, weekStartDate: week },
      { mealsJson: jsonStr },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return successResponse(res, plan, 200);
  } catch (err) { next(err); }
}

export async function generateMealPlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const week = (req.query.week as string) || req.body.weekStartDate || new Date().toISOString().split("T")[0];
    // Simple generation: create 7-day placeholder based on user preferences
    // In production this would call AI; here we generate balanced placeholder
    const mockDays: any = {};
    const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
    const mealsPool = [
      { mealType: "Breakfast", recipeTitle: "Oatmeal with Berries", calories: 320, protein: 12, carbs: 48, fat: 8, prepTimeMin: 10 },
      { mealType: "Lunch", recipeTitle: "Grilled Chicken Bowl", calories: 540, protein: 42, carbs: 38, fat: 18, prepTimeMin: 20 },
      { mealType: "Dinner", recipeTitle: "Salmon & Quinoa", calories: 480, protein: 36, carbs: 32, fat: 22, prepTimeMin: 25 },
      { mealType: "Snack", recipeTitle: "Greek Yogurt & Nuts", calories: 210, protein: 14, carbs: 12, fat: 12, prepTimeMin: 5 },
    ];
    days.forEach((d) => { mockDays[d] = mealsPool; });
    const jsonStr = JSON.stringify({ days: mockDays, weekStartDate: week, generatedAt: new Date().toISOString() });
    const plan = await MealPlan.findOneAndUpdate(
      { userId: req.userId, weekStartDate: week },
      { mealsJson: jsonStr },
      { upsert: true, new: true }
    );
    try {
      const parsed = JSON.parse(plan.mealsJson);
      return successResponse(res, { ...plan.toObject(), meals: parsed, days: parsed.days || parsed });
    } catch { return successResponse(res, plan); }
  } catch (err) { next(err); }
}
