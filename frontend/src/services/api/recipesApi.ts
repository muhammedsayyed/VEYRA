import { request } from "./client";

export async function listRecipes(params: Record<string, any> = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") qs.set(k, String(v)); });
  const q = qs.toString() ? `?${qs.toString()}` : "";
  return request<any>(`/recipes${q}`, { method: "GET" });
}
export async function getRecipe(id: string) {
  return request<any>(`/recipes/${encodeURIComponent(id)}`, { method: "GET" });
}
export async function getCountries() {
  return request<any[]>("/countries", { method: "GET" });
}
export async function getCategories() {
  return request<any[]>("/categories", { method: "GET" });
}
export async function getFavorites() {
  return request<any[]>("/favorites", { method: "GET" });
}
export async function addFavorite(recipe: { recipeId: string; recipeTitle: string; recipeImage?: string }) {
  return request<any>("/favorites", { method: "POST", body: JSON.stringify(recipe) });
}
export async function removeFavorite(recipeId: string) {
  return request<any>(`/favorites?recipeId=${encodeURIComponent(recipeId)}`, { method: "DELETE" });
}
