import { Response } from "express";

export function successResponse(res: Response, data: any, status = 200, meta?: any) {
  const payload: any = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
}

export function errorResponse(res: Response, message: string, status = 400, errors?: any) {
  const payload: any = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(status).json(payload);
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any;
  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
