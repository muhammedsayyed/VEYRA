import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { ShoppingListItem } from "../models/ShoppingListItem.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function getShoppingList(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await ShoppingListItem.find({ userId: req.userId }).sort({ createdAt: -1 });
    return successResponse(res, items);
  } catch (err) { next(err); }
}

export async function addShoppingItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Support batch via { items: [...] } as frontend does
    if (Array.isArray(req.body.items)) {
      const docs = await ShoppingListItem.insertMany(
        req.body.items.map((i: any) => ({
          userId: req.userId,
          name: String(i.name).trim(),
          quantity: i.quantity ?? 1,
          unit: i.unit || "pcs",
          recipeId: i.recipeId,
        }))
      );
      return successResponse(res, docs, 201);
    }

    const { name, quantity, unit, recipeId } = req.body;
    if (!name || !String(name).trim()) return errorResponse(res, "Name is required", 400);
    const item = await ShoppingListItem.create({
      userId: req.userId,
      name: String(name).trim(),
      quantity: quantity ?? 1,
      unit: unit || "pcs",
      recipeId,
    });
    return successResponse(res, item, 201);
  } catch (err) { next(err); }
}

export async function updateShoppingItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id || req.query.id as string || req.body.id;
    if (!id) return errorResponse(res, "Missing shopping item ID", 400);
    const updates: any = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
    if (req.body.quantity !== undefined) updates.quantity = req.body.quantity;
    if (req.body.unit !== undefined) updates.unit = req.body.unit;
    if (req.body.isPurchased !== undefined) updates.isPurchased = Boolean(req.body.isPurchased);
    if (req.body.recipeId !== undefined) updates.recipeId = req.body.recipeId;

    const item = await ShoppingListItem.findOneAndUpdate({ _id: id, userId: req.userId }, updates, { new: true });
    if (!item) return errorResponse(res, "Shopping item not found", 404);
    return successResponse(res, item);
  } catch (err) { next(err); }
}

export async function deleteShoppingItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const action = req.query.action as string;
    if (action === "clear-purchased") {
      await ShoppingListItem.deleteMany({ userId: req.userId, isPurchased: true });
      return successResponse(res, { message: "Cleared purchased" });
    }
    if (action === "clear-all") {
      await ShoppingListItem.deleteMany({ userId: req.userId });
      return successResponse(res, { message: "Cleared all" });
    }
    const id = req.params.id || req.query.id as string;
    if (!id) return errorResponse(res, "Missing shopping item ID", 400);
    const deleted = await ShoppingListItem.findOneAndDelete({ _id: id, userId: req.userId });
    if (!deleted) return errorResponse(res, "Shopping item not found", 404);
    return successResponse(res, { message: "Deleted" });
  } catch (err) { next(err); }
}
