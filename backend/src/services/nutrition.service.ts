import { FoodLog } from "../models/FoodLog.js";
import { DailyNutrition } from "../models/DailyNutrition.js";
import { AppError } from "../utils/apiResponse.js";

export async function getFoodLogs(userId: string, date?: string) {
  const filter: any = { userId };
  if (date) filter.date = date;
  const logs = await FoodLog.find(filter).sort({ createdAt: -1 });
  if (date) {
    const daily = await DailyNutrition.findOne({ userId, date });
    return { logs, summary: daily };
  }
  return { logs };
}
export async function addFoodLog(userId: string, data: any) {
  const title = String(data.productName || data.name || "").trim();
  if (!title) throw new AppError("Food name is required", 400);
  const logDate = data.date ? String(data.date) : new Date().toISOString().split('T')[0];
  const meal = String(data.mealType || data.sectionId || "lunch").toLowerCase();
  const log = await FoodLog.create({
    userId,
    date: logDate,
    mealType: meal,
    productBarcode: data.productBarcode ? String(data.productBarcode) : undefined,
    productName: title,
    brand: data.brand,
    imageUrl: data.imageUrl,
    servingSize: data.servingSize,
    grams: data.grams ?? 100,
    servings: data.servings ?? 1,
    calories: data.calories ?? 0,
    protein: data.protein ?? 0,
    carbs: data.carbs ?? 0,
    sugar: data.sugar,
    fat: data.fat ?? 0,
    saturatedFat: data.saturatedFat,
    fiber: data.fiber,
    sodium: data.sodium,
    salt: data.salt,
  });
  await DailyNutrition.findOneAndUpdate(
    { userId, date: logDate },
    { $inc: { caloriesConsumed: log.calories, proteinConsumed: log.protein, carbsConsumed: log.carbs, fatConsumed: log.fat }, $setOnInsert: { calorieTarget: 2100, proteinTarget: 130, carbsTarget: 240, fatTarget: 70, waterTarget: 2.5, waterConsumed: 0 } },
    { upsert: true, new: true }
  );
  return log;
}
export async function deleteFoodLog(userId: string, id: string) {
  const log = await FoodLog.findOne({ _id: id, userId });
  if (!log) throw new AppError("Food log not found", 404);
  await FoodLog.deleteOne({ _id: id });
  await DailyNutrition.findOneAndUpdate({ userId, date: log.date }, { $inc: { caloriesConsumed: -log.calories, proteinConsumed: -log.protein, carbsConsumed: -log.carbs, fatConsumed: -log.fat } });
  await DailyNutrition.updateOne({ userId, date: log.date, caloriesConsumed: { $lt: 0 } }, { $set: { caloriesConsumed: 0 } });
  return { message: "Deleted" };
}
export async function getDailyNutrition(userId: string, date: string) {
  let daily = await DailyNutrition.findOne({ userId, date });
  if (!daily) daily = await DailyNutrition.create({ userId, date, calorieTarget: 2100, proteinTarget: 130, carbsTarget: 240, fatTarget: 70, waterTarget: 2.5 });
  return daily;
}
export async function updateWater(userId: string, date: string, waterConsumed: number) {
  const daily = await DailyNutrition.findOneAndUpdate(
    { userId, date: String(date) },
    { waterConsumed: Number(waterConsumed), $setOnInsert: { calorieTarget: 2100, proteinTarget: 130, carbsTarget: 240, fatTarget: 70, waterTarget: 2.5 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return daily;
}
