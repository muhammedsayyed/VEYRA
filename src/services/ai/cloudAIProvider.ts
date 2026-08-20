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
    this.baseUrl =
      process.env.VEYRA_AI_CLOUD_BASE_URL ||
      process.env.AI_GATEWAY_URL ||
      process.env.OPENROUTER_BASE_URL ||
      'https://openrouter.ai/api/v1';

    this.apiKey =
      process.env.VEYRA_AI_CLOUD_API_KEY ||
      process.env.AI_GATEWAY_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      '';

    this.model =
      process.env.VEYRA_AI_CLOUD_MODEL ||
      process.env.AI_GATEWAY_MODEL ||
      process.env.OPENROUTER_MODEL ||
      'openai/gpt-oss-20b:free';
  }

  async generateChatResponse(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: VeyraUserContext
  ): Promise<ServerAIResponse> {
    if (!this.apiKey) {
      return {
        isUnavailable: true,
        error:
          'Cloud AI key missing. Please configure VEYRA_AI_CLOUD_API_KEY or OPENROUTER_API_KEY in environment variables.',
        provider: `${this.name} (${this.model})`,
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

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://veyra-wellness-ai.vercel.app',
          'X-Title': 'Veyra Wellness AI',
        },
        body: JSON.stringify({
          model: this.model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 450,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errMessage = `Cloud AI provider error (${res.status})`;
        try {
          const errJson = await res.json();
          if (errJson?.error?.message) {
            errMessage = errJson.error.message;
          }
        } catch {
          // fallback message
        }

        return {
          isUnavailable: true,
          error: errMessage,
          provider: `cloud/${this.model}`,
        };
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim();

      if (!text) {
        return {
          isUnavailable: true,
          error: 'Empty response returned from Cloud AI service.',
          provider: `cloud/${this.model}`,
        };
      }

      return {
        message: text,
        conversationId: `conv_cloud_${Date.now()}`,
        provider: `cloud/${this.model}`,
        usage: {
          promptTokens: data?.usage?.prompt_tokens,
          completionTokens: data?.usage?.completion_tokens,
        },
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      const errMsg = isTimeout
        ? 'Cloud AI request timed out after 15 seconds.'
        : 'Cloud AI service connection failed.';

      return {
        isUnavailable: true,
        error: errMsg,
        provider: `cloud/${this.model}`,
      };
    }
  }
}
