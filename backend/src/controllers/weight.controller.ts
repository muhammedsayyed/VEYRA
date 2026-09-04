import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { WeightHistory } from "../models/WeightHistory.js";
import { User } from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function getWeightHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const history = await WeightHistory.find({ userId: req.userId }).sort({ date: 1 });
    return successResponse(res, history);
  } catch (err) { next(err); }
}

export async function addWeightEntry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { weight, date } = req.body;
    if (weight === undefined || isNaN(Number(weight))) return errorResponse(res, "Weight is required and must be a number", 400);
    const entryDate = date ? String(date) : new Date().toISOString().split("T")[0];
    const entry = await WeightHistory.create({ userId: req.userId, weight: Number(weight), date: entryDate });
    // also update user's current weight
    await User.findByIdAndUpdate(req.userId, { weight: Number(weight) });
    return successResponse(res, entry, 201);
  } catch (err) { next(err); }
}
