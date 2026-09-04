import { request } from "./client";

export async function getPantry() {
  return request<any[]>("/pantry", { method: "GET" });
}
export async function addPantryItem(data: { name: string; quantity?: number; unit?: string; expirationDate?: string }) {
  return request<any>("/pantry", { method: "POST", body: JSON.stringify(data) });
}
export async function updatePantryItem(id: string, data: any) {
  return request<any>(`/pantry/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function deletePantryItem(id: string) {
  return request<any>(`/pantry/${encodeURIComponent(id)}`, { method: "DELETE" });
}
