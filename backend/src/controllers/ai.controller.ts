import { Request, Response, NextFunction } from "express";
import * as aiService from "../services/ai.service.js";

// Controller thin - delegates to service (backend owns provider credentials)
export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { messages, userContext } = req.body;
    const result = await aiService.chatWithAI(messages || [], userContext);
    return res.json(result);
  } catch (err) { next(err); }
}
