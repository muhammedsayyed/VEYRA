import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/apiResponse.js";

export function notFound(req: Request, res: Response, next: NextFunction) {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e: any) => e.message);
    message = errors.join(", ");
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for ${field}`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  const isProd = process.env.NODE_ENV === "production";
  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors ? { errors: err.errors } : {}),
    ...(!isProd && statusCode === 500 ? { stack: err.stack } : {}),
  });
}
