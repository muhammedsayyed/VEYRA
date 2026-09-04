import { PantryItem } from "../models/PantryItem.js";
import { AppError } from "../utils/apiResponse.js";

export async function listPantry(userId: string) {
  return PantryItem.find({ userId }).sort({ addedDate: -1 });
}
export async function createPantry(userId: string, data: any) {
  if (!data.name) throw new AppError("Name is required", 400);
  return PantryItem.create({
    userId,
    name: String(data.name).trim(),
    quantity: data.quantity ?? 1,
    unit: data.unit || "pcs",
    expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
  });
}
export async function updatePantry(userId: string, id: string, updates: any) {
  const item = await PantryItem.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
  if (!item) throw new AppError("Pantry item not found", 404);
  return item;
}
export async function deletePantry(userId: string, id: string) {
  const del = await PantryItem.findOneAndDelete({ _id: id, userId });
  if (!del) throw new AppError("Pantry item not found", 404);
  return del;
}
