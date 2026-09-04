import { request } from "./client";

export interface MealPayload {
  name: string;
  sectionId?: string;
  mealType?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  grams?: number;
  servings?: number;
  productBarcode?: string;
  imageUrl?: string;
  date?: string;
}

export async function getMeals(date?: string) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  return request<any>(`/food-log${q}`, { method: "GET" });
}
export async function createMeal(data: MealPayload) {
  return request<any>("/food-log", { method: "POST", body: JSON.stringify(data) });
}
export async function deleteMeal(id: string) {
  return request<any>(`/food-log/${encodeURIComponent(id)}`, { method: "DELETE" });
}
export async function getDailyNutrition(date?: string) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  return request<any>(`/nutrition/daily${q}`);
}
export async function updateWater(waterConsumed: number, date?: string) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  return request<any>(`/nutrition/water${q}`, { method: "POST", body: JSON.stringify({ waterConsumed }) });
}
