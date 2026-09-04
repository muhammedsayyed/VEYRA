import { ShoppingListItem } from "../models/ShoppingListItem.js";
import { AppError } from "../utils/apiResponse.js";

export async function listShopping(userId: string) {
  return ShoppingListItem.find({ userId }).sort({ createdAt: -1 });
}
export async function createShopping(userId: string, data: any) {
  if (!data.name) throw new AppError("Name is required", 400);
  return ShoppingListItem.create({
    userId,
    name: String(data.name).trim(),
    quantity: data.quantity ?? 1,
    unit: data.unit || "pcs",
    recipeId: data.recipeId,
  });
}
export async function createBatch(userId: string, items: any[]) {
  if (!Array.isArray(items) || items.length === 0) throw new AppError("Items array required", 400);
  return ShoppingListItem.insertMany(items.map(i=>({ userId, name: String(i.name).trim(), quantity: i.quantity ?? 1, unit: i.unit || "pcs", recipeId: i.recipeId })));
}
export async function updateShopping(userId: string, id: string, updates: any) {
  const item = await ShoppingListItem.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
  if (!item) throw new AppError("Shopping item not found", 404);
  return item;
}
export async function deleteShopping(userId: string, id: string) {
  const del = await ShoppingListItem.findOneAndDelete({ _id: id, userId });
  if (!del) throw new AppError("Shopping item not found", 404);
  return del;
}
export async function clearPurchased(userId: string) {
  await ShoppingListItem.deleteMany({ userId, isPurchased: true });
}
export async function clearAll(userId: string) {
  await ShoppingListItem.deleteMany({ userId });
}
