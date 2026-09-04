import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, user.toSafeObject());
  } catch (err) { next(err); }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const updates: any = {};
    const allowed = ["firstName", "lastName", "wellnessGoal", "goal", "age", "height", "weight", "targetWeight", "activityLevel", "dietaryPreferences", "allergens", "favoriteFoods", "gender"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === "goal") updates["wellnessGoal"] = req.body[key];
        else updates[key] = req.body[key];
      }
    }
    // Handle combined name field
    if (req.body.name && !req.body.firstName) {
      const parts = String(req.body.name).trim().split(" ");
      updates.firstName = parts[0];
      updates.lastName = parts.slice(1).join(" ");
    }
    // Handle single name split
    if (updates.firstName && typeof updates.firstName === "string") updates.firstName = updates.firstName.trim();
    if (updates.lastName && typeof updates.lastName === "string") updates.lastName = updates.lastName.trim();

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, user.toSafeObject());
  } catch (err) { next(err); }
}
