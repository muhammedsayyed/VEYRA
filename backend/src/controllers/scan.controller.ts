import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { ScanHistory } from "../models/ScanHistory.js";
import { successResponse } from "../utils/apiResponse.js";

export async function getScans(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const scans = await ScanHistory.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, scans);
  } catch (err) { next(err); }
}

export async function addScan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { barcode, productName, brand, imageUrl, productJson, name, code } = req.body;
    const bc = String(barcode || code || "").trim();
    const title = String(productName || name || "Scanned Product").trim();
    if (!bc) return successResponse(res, { message: "No barcode" }, 400);
    const scan = await ScanHistory.create({
      userId: req.userId,
      barcode: bc,
      productName: title,
      brand,
      imageUrl,
      productJson: productJson || req.body,
    });
    return successResponse(res, scan, 201);
  } catch (err) { next(err); }
}
