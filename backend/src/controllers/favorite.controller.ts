import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { FavoriteRecipe } from "../models/FavoriteRecipe.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function getFavorites(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const favs = await FavoriteRecipe.find({ userId: req.userId }).sort({ createdAt: -1 });
    return successResponse(res, favs);
  } catch (err) { next(err); }
}

export async function addFavorite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { recipeId, recipeTitle, recipeImage, recipeCategory, recipeCountry } = req.body;
    if (!recipeId || !recipeTitle) return errorResponse(res, "recipeId and recipeTitle are required", 400);
    const fav = await FavoriteRecipe.findOneAndUpdate(
      { userId: req.userId, recipeId: String(recipeId) },
      { recipeTitle, recipeImage, recipeCategory, recipeCountry },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return successResponse(res, fav, 201);
  } catch (err) { next(err); }
}

export async function removeFavorite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const recipeId = (req.query.recipeId as string) || req.params.id;
    if (!recipeId) return errorResponse(res, "Missing recipeId", 400);
    const deleted = await FavoriteRecipe.findOneAndDelete({ userId: req.userId, recipeId: String(recipeId) });
    if (!deleted) return errorResponse(res, "Favorite not found", 404);
    return successResponse(res, { message: "Removed" });
  } catch (err) { next(err); }
}
