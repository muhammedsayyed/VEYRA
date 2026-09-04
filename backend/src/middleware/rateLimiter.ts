import rateLimit from "express-rate-limit";

// Auth limiter: 10 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again after 15 minutes." },
  keyGenerator: (req) => `${req.ip}:${req.body?.email || req.query?.email || "anon"}`,
});

// Stricter for register/login specifically handled above
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again later." },
});

// AI chat limiter: 30 requests per minute per user/IP, to prevent abuse but allow normal use
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests, please wait a moment." },
  keyGenerator: (req: any) => req.userId || req.ip,
});

// General API limiter (optional, not applied to all CRUD to keep usability)
// Could be applied globally with higher limit if needed.
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please slow down." },
});
