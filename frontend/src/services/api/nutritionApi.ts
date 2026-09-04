import { request } from "./client";

export async function getDaily(date?: string) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  return request<any>(`/nutrition/daily${q}`);
}
export async function logWater(amountL: number, date?: string) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  return request<any>(`/nutrition/water${q}`, { method: "POST", body: JSON.stringify({ waterConsumed: amountL }) });
}
export async function getMealPlan(week: string) {
  return request<any>(`/meal-plan?week=${encodeURIComponent(week)}`);
}
export async function saveMealPlan(week: string, data: any) {
  return request<any>(`/meal-plan?week=${encodeURIComponent(week)}`, { method: "POST", body: JSON.stringify({ mealsJson: typeof data === "string" ? data : JSON.stringify(data) }) });
}
export async function generateMealPlan(week: string) {
  return request<any>(`/meal-plan/generate?week=${encodeURIComponent(week)}`, { method: "POST" });
}
