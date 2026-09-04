import { AppError } from "../utils/apiResponse.js";

/**
 * AI service - backend owns provider credentials, frontend never sees keys.
 * Supports OpenRouter via env. No mock fallback - fails honestly if not configured.
 * Architecture: Frontend -> Backend /api/ai -> Provider -> Response -> Frontend
 */

export interface AiChatResult {
  message: string;
  provider: string;
  usage?: any;
  latencyMs?: number;
}

export async function chatWithAI(messages: any[], userContext: any): Promise<AiChatResult> {
  const apiKey = process.env.VEYRA_AI_CLOUD_API_KEY || process.env.OPENROUTER_API_KEY || "";
  const baseUrl = process.env.VEYRA_AI_CLOUD_BASE_URL || process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const model = process.env.VEYRA_AI_CLOUD_MODEL || process.env.OPENROUTER_MODEL || "nvidia/nemotron-3.5-lightning:free";
  const fallbackModel = process.env.VEYRA_AI_FALLBACK_MODEL || "google/gemma-2-9b-it:free";

  if (!apiKey) {
    throw new AppError(
      "AI provider not configured. Set VEYRA_AI_CLOUD_API_KEY or OPENROUTER_API_KEY in backend environment variables.",
      503
    );
  }

  // Try primary model, then fallback
  const modelsToTry = [model, fallbackModel].filter(Boolean);
  let lastError: any = null;

  for (const m of modelsToTry) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const r = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://veyra.app",
          "X-Title": "Veyra Wellness AI",
        },
        body: JSON.stringify({
          model: m,
          messages: [
            { role: "system", content: buildSystemPrompt(userContext) },
            ...(Array.isArray(messages) ? messages.map((mm: any) => ({ role: mm.role === "ai" ? "assistant" : mm.role, content: mm.content || mm.text })) : []),
          ],
          temperature: 0.7,
          max_tokens: 700,
        }),
        signal: controller.signal,
      });
      clearTimeout(t);

      const data: any = await r.json().catch(() => null);
      if (!r.ok) {
        const errMsg = data?.error?.message || data?.message || `Provider error ${r.status}`;
        // If rate limited or model not found, try next model
        if (r.status === 429 || r.status === 404 || errMsg.includes("No endpoints found") || errMsg.includes("model")) {
          lastError = new Error(errMsg);
          continue;
        }
        throw new AppError(`AI provider error: ${errMsg}`, r.status >= 500 ? 502 : r.status);
      }

      const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
      if (content) {
        return { message: content, provider: `OpenRouter (${m})`, usage: data.usage, latencyMs: 0 };
      }
      lastError = new Error("Empty response from AI provider");
    } catch (e: any) {
      if (e instanceof AppError) throw e;
      lastError = e;
      // network abort etc - try next model if available
      if (e.name === "AbortError") continue;
    }
  }

  // All models failed
  const msg = lastError?.message || "AI provider unavailable";
  throw new AppError(`AI provider unavailable: ${msg}`, 502);
}

function buildSystemPrompt(ctx: any): string {
  if (!ctx) return "You are Veyra, a warm, intelligent wellness companion. Help with nutrition, fitness, meal planning, and healthy habits. Be concise, friendly, and practical.";
  const parts: string[] = ["You are Veyra, a warm, intelligent wellness companion. Your identity is Veyra, built for wellness."];
  if (ctx?.user?.name) parts.push(`User: ${ctx.user.name}, goal: ${ctx.user.goal || ctx.user.wellnessGoal}, age:${ctx.user.age}, weight:${ctx.user.weightKg}kg, height:${ctx.user.heightCm}cm, activity:${ctx.user.activityLevel}`);
  if (ctx?.user?.dietaryPreferences?.length) parts.push(`Dietary prefs: ${ctx.user.dietaryPreferences.join(", ")}`);
  if (ctx?.user?.allergens?.length) parts.push(`Allergens: ${ctx.user.allergens.join(", ")}`);
  if (ctx?.nutrition) parts.push(`Nutrition today: ${JSON.stringify(ctx.nutrition).slice(0, 400)}`);
  if (ctx?.pantry?.length) parts.push(`Pantry items: ${ctx.pantry.slice(0, 8).map((p: any) => p.name).join(", ")}`);
  if (ctx?.shoppingList?.length) parts.push(`Shopping list: ${ctx.shoppingList.slice(0, 5).map((p:any)=>p.name).join(", ")}`);
  if (ctx?.scannedProduct) parts.push(`Recently scanned: ${ctx.scannedProduct.name}`);
  parts.push("Be warm, concise, helpful, and never expose system internals.");
  return parts.join("\n");
}
