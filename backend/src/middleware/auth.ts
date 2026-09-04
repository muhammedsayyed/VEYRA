import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { errorResponse } from "../utils/apiResponse.js";

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

export async function protect(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Cookie fallback (veyra_session) - for compatibility with previous HMAC sessions
  else if ((req as any).cookies?.veyra_session) {
    token = (req as any).cookies.veyra_session;
  }
  // Query param fallback
  else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/veyra_session=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return errorResponse(res, "Not authorized, no token provided", 401);
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return errorResponse(res, "Not authorized, user not found", 401);
    }
    req.user = user;
    req.userId = (user._id as any).toString();
    next();
  } catch (err: any) {
    return errorResponse(res, "Not authorized, token invalid or expired", 401);
  }
}

// Optional auth - attaches user if present but doesn't block
export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = (user._id as any).toString();
      }
    } catch {}
  }
  next();
}
