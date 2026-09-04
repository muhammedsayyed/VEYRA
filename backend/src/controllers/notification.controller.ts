import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notifs = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, notifs);
  } catch (err) { next(err); }
}

export async function addNotification(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, message, category } = req.body;
    if (!title || !message || !category) return errorResponse(res, "title, message and category are required", 400);
    const notif = await Notification.create({ userId: req.userId, title, message, category });
    return successResponse(res, notif, 201);
  } catch (err) { next(err); }
}

export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id || req.query.id as string;
    if (!id) return errorResponse(res, "Missing notification id", 400);
    const notif = await Notification.findOneAndUpdate({ _id: id, userId: req.userId }, { isRead: true }, { new: true });
    if (!notif) return errorResponse(res, "Notification not found", 404);
    return successResponse(res, notif);
  } catch (err) { next(err); }
}
