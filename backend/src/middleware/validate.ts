import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { errorResponse } from "../utils/apiResponse.js";

export function zodValidate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === "body" ? req.body : source === "query" ? req.query : req.params;
      const parsed = schema.parse(data);
      // overwrite with parsed (coerced) values
      if (source === "body") req.body = parsed;
      else if (source === "query") Object.assign(req.query, parsed);
      else Object.assign(req.params, parsed);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const first = (err as any).issues?.[0] || (err as any).errors?.[0];
        const all = (err as any).issues || (err as any).errors;
        return errorResponse(res, first?.message || "Validation failed", 400, all);
      }
      next(err);
    }
  };
}

// Legacy express-validator helper (kept for compat, not used for new routes)
import { validationResult } from "express-validator";
export function handleValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((e: any) => e.msg);
    return errorResponse(res, msgs[0] || "Validation failed", 400, errors.array());
  }
  next();
}
