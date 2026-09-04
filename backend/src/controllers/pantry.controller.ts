import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { PantryItem } from "../models/PantryItem.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function getPantry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await PantryItem.find({ userId: req.userId }).sort({ addedDate: -1 });
    return successResponse(res, items);
  } catch (err) { next(err); }
}

export async function addPantryItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, quantity, unit, expirationDate } = req.body;
    if (!name || !String(name).trim()) return errorResponse(res, "Name is required", 400);
    const item = await PantryItem.create({
      userId: req.userId,
      name: String(name).trim(),
      quantity: quantity ?? 1,
      unit: unit || "pcs",
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
    });
    return successResponse(res, item, 201);
  } catch (err) { next(err); }
}

export async function updatePantryItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id || req.query.id as string || req.body.id;
    if (!id) return errorResponse(res, "Missing pantry item ID", 400);
    const updates: any = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
    if (req.body.quantity !== undefined) updates.quantity = req.body.quantity;
    if (req.body.unit !== undefined) updates.unit = req.body.unit;
    if (req.body.expirationDate !== undefined) updates.expirationDate = req.body.expirationDate ? new Date(req.body.expirationDate) : null;
    if (req.body.isUsed !== undefined) updates.isUsed = Boolean(req.body.isUsed);

    const item = await PantryItem.findOneAndUpdate({ _id: id, userId: req.userId }, updates, { new: true });
    if (!item) return errorResponse(res, "Pantry item not found", 404);
    return successResponse(res, item);
  } catch (err) { next(err); }
}

export async function deletePantryItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id || req.query.id as string;
    if (!id) return errorResponse(res, "Missing pantry item ID", 400);
    const deleted = await PantryItem.findOneAndDelete({ _id: id, userId: req.userId });
    if (!deleted) return errorResponse(res, "Pantry item not found", 404);
    return successResponse(res, { message: "Deleted" });
  } catch (err) { next(err); }
}
