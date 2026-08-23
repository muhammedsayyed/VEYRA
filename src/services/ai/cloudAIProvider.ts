import { VeyraUserContext } from './aiContext';
import { IServerAIProvider, ServerAIResponse, buildSystemPrompt } from './serverAIProvider';

/**
 * CloudAIProvider
 * Server-side provider handling queries to a production Cloud AI API (OpenRouter, Groq, Together AI, or Vercel AI Gateway).
 * Runs completely server-side inside Vercel Serverless Functions.
 */
export class CloudAIProvider implements IServerAIProvider {
  name = 'Production Cloud AI Provider';
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    const cleanEnv = (val: string | undefined): string => {
      if (!val) return '';
      return val.replace(/[\r\n"']/g, '').trim();
    };

    this.baseUrl =
      cleanEnv(process.env.VEYRA_AI_CLOUD_BASE_URL) ||
      cleanEnv(process.env.AI_GATEWAY_URL) ||
      cleanEnv(process.env.OPENROUTER_BASE_URL) ||
      'https://openrouter.ai/api/v1';

    this.apiKey =
      cleanEnv(process.env.VEYRA_AI_CLOUD_API_KEY) ||
      cleanEnv(process.env.AI_GATEWAY_API_KEY) ||
      cleanEnv(process.env.OPENROUTER_API_KEY) ||
      '';

    this.model =
      cleanEnv(process.env.VEYRA_AI_CLOUD_MODEL) ||
      cleanEnv(process.env.AI_GATEWAY_MODEL) ||
      cleanEnv(process.env.OPENROUTER_MODEL) ||
      'nvidia/nemotron-3.5-lightning:free';
  }

  async generateChatResponse(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: VeyraUserContext
  ): Promise<ServerAIResponse> {
    const startTime = Date.now();

    if (!this.apiKey) {
      return {
        isUnavailable: true,
        error:
          'Cloud AI key missing. Please configure VEYRA_AI_CLOUD_API_KEY or OPENROUTER_API_KEY in environment variables.',
        provider: `${this.name} (${this.model})`,
        latencyMs: Date.now() - startTime,
      };
    }

    const formattedMessages = [
      { role: 'system' as const, content: buildSystemPrompt(context) },
      ...messages.map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
    ];

    const url = this.baseUrl.endsWith('/chat/completions')
      ? this.baseUrl
      : `${this.baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const candidateModels = Array.from(
      new Set([
        this.model,
        'nvidia/nemotron-3.5-lightning:free',
        'google/gemma-4-31b-it:free',
        'google/gemma-4-26b-a4b-it:free',
        'liquid/lfm-2.5-2.6b:free',
        'z-ai/glm-5.2:free',
        'dots-studio/dots-3-note-preview:free',
      ])
    );


    let lastError = 'Cloud AI model service error.';

    for (const targetModel of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://veyra-wellness-ai.vercel.app',
            'X-Title': 'Veyra Wellness AI',
          },
          body: JSON.stringify({
            model: targetModel,
            messages: formattedMessages,
            temperature: 0.7,
            // Reasoning-style models spend tokens before the visible answer.
            // Disable reasoning output where supported (ignored otherwise) and
            // keep enough token headroom to avoid empty-content truncations.
            reasoning: { enabled: false },
            max_tokens: 700,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          try {
            const errJson = await res.json();
            if (errJson?.error?.message) {
              lastError = errJson.error.message;
            } else {
              lastError = `Model ${targetModel} returned status ${res.status}`;
            }
          } catch {
            lastError = `Model ${targetModel} returned status ${res.status}`;
          }
          console.warn(`[CloudAIProvider] Model ${targetModel} failed (${res.status}): ${lastError}. Trying fallback model...`);
          continue;
        }

        const data = await res.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        let text = '';
        if (typeof rawContent === 'string') {
          // Some models embed chain-of-thought inline; strip <think> blocks.
          text = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        } else if (Array.isArray(rawContent)) {
          text = rawContent
            .map((item: any) => (typeof item === 'string' ? item : item?.text || ''))
            .join('')
            .trim();
        }

        if (!text) {
          lastError = `Empty response returned from model ${targetModel}`;
          continue;
        }

        const latencyMs = Date.now() - startTime;
        console.log(`[CloudAIProvider] Success using model ${targetModel} in ${latencyMs}ms`);

        return {
          message: text,
          conversationId: `conv_cloud_${Date.now()}`,
          provider: `OpenRouter (${targetModel})`,
          usage: {
            promptTokens: data?.usage?.prompt_tokens,
            completionTokens: data?.usage?.completion_tokens,
          },
          latencyMs,
        };
      } catch (err: any) {
        const isTimeout = err?.name === 'AbortError';
        lastError = isTimeout
          ? `Model ${targetModel} request timed out after 12s.`
          : `Model ${targetModel} connection failed: ${err?.message || 'Network error'}`;
        console.warn(`[CloudAIProvider] ${lastError}`);
      }
    }

    return {
      isUnavailable: true,
      error: `All Cloud AI candidate models failed. Last error: ${lastError}`,
      provider: `cloud/${this.model}`,
      latencyMs: Date.now() - startTime,
    };
  }
}
