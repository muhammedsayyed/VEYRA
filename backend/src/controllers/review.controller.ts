import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { RecipeReview } from "../models/RecipeReview.js";
import { User } from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function getReviews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const recipeId = req.query.recipeId as string;
    if (!recipeId) return errorResponse(res, "Missing recipeId", 400);
    const reviews = await RecipeReview.find({ recipeId: String(recipeId) }).sort({ createdAt: -1 }).lean();
    // populate userName
    const userIds = [...new Set(reviews.map(r => r.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select("firstName lastName").lean();
    const map = new Map(users.map(u => [(u as any)._id.toString(), `${(u as any).firstName} ${(u as any).lastName}`.trim()]));
    const enriched = reviews.map(r => ({ ...r, userName: map.get(r.userId.toString()) || "Anonymous Member" }));
    return successResponse(res, enriched);
  } catch (err) { next(err); }
}

export async function addReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { recipeId, rating, text } = req.body;
    if (!recipeId || rating === undefined || !text) return errorResponse(res, "recipeId, rating and text are required", 400);
    if (Number(rating) < 1 || Number(rating) > 5) return errorResponse(res, "Rating must be between 1 and 5", 400);
    const review = await RecipeReview.create({ userId: req.userId, recipeId: String(recipeId), rating: Number(rating), text: String(text).trim() });
    const user = await User.findById(req.userId).select("firstName lastName");
    const withName = { ...review.toObject(), userName: user ? `${user.firstName} ${user.lastName}`.trim() : "Member" };
    return successResponse(res, withName, 201);
  } catch (err) { next(err); }
}

export async function updateReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id || req.query.id as string;
    const { rating, text } = req.body;
    if (!id) return errorResponse(res, "Missing review id", 400);
    const review = await RecipeReview.findOne({ _id: id, userId: req.userId });
    if (!review) return errorResponse(res, "Review not found or unauthorized", 404);
    if (rating !== undefined) review.rating = Number(rating);
    if (text !== undefined) review.text = String(text).trim();
    await review.save();
    const user = await User.findById(req.userId).select("firstName lastName");
    return successResponse(res, { ...review.toObject(), userName: user ? `${user.firstName} ${user.lastName}`.trim() : "Member" });
  } catch (err) { next(err); }
}

export async function deleteReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id || req.query.id as string;
    if (!id) return errorResponse(res, "Missing review id", 400);
    const deleted = await RecipeReview.findOneAndDelete({ _id: id, userId: req.userId });
    if (!deleted) return errorResponse(res, "Review not found or unauthorized", 404);
    return successResponse(res, { message: "Deleted" });
  } catch (err) { next(err); }
}
