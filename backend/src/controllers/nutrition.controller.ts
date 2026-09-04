import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { FoodLog } from "../models/FoodLog.js";
import { DailyNutrition } from "../models/DailyNutrition.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function getFoodLogs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const date = req.query.date as string;
    const filter: any = { userId: req.userId };
    if (date) filter.date = date;
    const logs = await FoodLog.find(filter).sort({ createdAt: -1 });
    // optionally also return summary from DailyNutrition
    if (date) {
      const daily = await DailyNutrition.findOne({ userId: req.userId, date });
      return successResponse(res, { logs, summary: daily || null });
    }
    return successResponse(res, { logs });
  } catch (err) { next(err); }
}

export async function addFoodLog(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { date, mealType, sectionId, name, productName, productBarcode, brand, imageUrl, servingSize, grams, servings, calories, protein, carbs, fat, sugar, fiber, saturatedFat, sodium, salt } = req.body;
    const meal = String(mealType || sectionId || "lunch").toLowerCase();
    const title = String(productName || name || "Food").trim();
    const logDate = date ? String(date) : new Date().toISOString().split("T")[0];
    if (!title) return errorResponse(res, "Food name is required", 400);

    const log = await FoodLog.create({
      userId: req.userId,
      date: logDate,
      mealType: meal,
      productBarcode: productBarcode ? String(productBarcode) : undefined,
      productName: title,
      brand,
      imageUrl,
      servingSize,
      grams: grams ?? 100,
      servings: servings ?? 1,
      calories: calories ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      sugar,
      fat: fat ?? 0,
      saturatedFat,
      fiber,
      sodium,
      salt,
    });

    // update DailyNutrition incrementally
    await DailyNutrition.findOneAndUpdate(
      { userId: req.userId, date: logDate },
      {
        $inc: { caloriesConsumed: log.calories, proteinConsumed: log.protein, carbsConsumed: log.carbs, fatConsumed: log.fat },
        $setOnInsert: { calorieTarget: 2100, proteinTarget: 130, carbsTarget: 240, fatTarget: 70, waterTarget: 2.5, waterConsumed: 0 }
      },
      { upsert: true, new: true }
    );

    return successResponse(res, log, 201);
  } catch (err) { next(err); }
}

export async function deleteFoodLog(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id || req.query.id as string;
    if (!id) return errorResponse(res, "Missing log id", 400);
    const log = await FoodLog.findOne({ _id: id, userId: req.userId });
    if (!log) return errorResponse(res, "Food log not found", 404);
    await FoodLog.deleteOne({ _id: id });
    // decrement daily totals
    await DailyNutrition.findOneAndUpdate(
      { userId: req.userId, date: log.date },
      { $inc: { caloriesConsumed: -log.calories, proteinConsumed: -log.protein, carbsConsumed: -log.carbs, fatConsumed: -log.fat } }
    );
    // clamp negatives?
    await DailyNutrition.updateOne({ userId: req.userId, date: log.date, caloriesConsumed: { $lt: 0 } }, { $set: { caloriesConsumed: 0 } });
    await DailyNutrition.updateOne({ userId: req.userId, date: log.date, proteinConsumed: { $lt: 0 } }, { $set: { proteinConsumed: 0 } });
    return successResponse(res, { message: "Deleted" });
  } catch (err) { next(err); }
}

export async function getDailyNutrition(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
    let daily = await DailyNutrition.findOne({ userId: req.userId, date });
    if (!daily) {
      daily = await DailyNutrition.create({ userId: req.userId, date, calorieTarget: 2100, proteinTarget: 130, carbsTarget: 240, fatTarget: 70, waterTarget: 2.5 });
    }
    return successResponse(res, daily);
  } catch (err) { next(err); }
}

export async function updateWater(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const date = (req.query.date as string) || req.body.date || new Date().toISOString().split("T")[0];
    const waterConsumed = req.body.waterConsumed ?? req.body.water ?? req.body.amount;
    if (waterConsumed === undefined || isNaN(Number(waterConsumed))) return errorResponse(res, "waterConsumed is required as a number (liters)", 400);
    const daily = await DailyNutrition.findOneAndUpdate(
      { userId: req.userId, date: String(date) },
      { waterConsumed: Number(waterConsumed), $setOnInsert: { calorieTarget: 2100, proteinTarget: 130, carbsTarget: 240, fatTarget: 70, waterTarget: 2.5 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return successResponse(res, daily);
  } catch (err) { next(err); }
}
