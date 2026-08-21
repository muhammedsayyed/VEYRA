import { VeyraUserContext } from './aiContext';
import { IServerAIProvider, ServerAIResponse, buildSystemPrompt } from './serverAIProvider';

/**
 * LocalOllamaProvider
 * Server-side provider handling development queries to a local Ollama instance (qwen2.5:3b).
 */
export class LocalOllamaProvider implements IServerAIProvider {
  name = 'Local Ollama Provider';
  private baseUrl: string;
  private model: string;

  constructor() {
    const isVercelOrProd = Boolean(
      process.env.VERCEL ||
      process.env.VERCEL_ENV ||
      process.env.NODE_ENV === 'production'
    );

    if (isVercelOrProd) {
      throw new Error(
        'SECURITY ERROR: LocalOllamaProvider cannot be instantiated in production or Vercel. Production AI requests must use CloudAIProvider.'
      );
    }

    this.baseUrl =
      process.env.VEYRA_AI_BASE_URL ||
      process.env.AI_BASE_URL ||
      'http://localhost:11434/v1';

    this.model = process.env.VEYRA_AI_MODEL || process.env.AI_MODEL || 'qwen2.5:3b';
  }

  async generateChatResponse(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: VeyraUserContext
  ): Promise<ServerAIResponse> {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 400,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          isUnavailable: true,
          error: `Local Ollama server returned HTTP status ${res.status}: ${res.statusText}`,
          provider: `${this.name} (${this.model})`,
        };
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim() || data?.message?.content?.trim();

      if (!text) {
        return {
          isUnavailable: true,
          error: 'Empty response returned from local model server.',
          provider: `${this.name} (${this.model})`,
        };
      }

      return {
        message: text,
        conversationId: `conv_local_${Date.now()}`,
        provider: `ollama/${this.model}`,
        usage: {
          promptTokens: data?.usage?.prompt_tokens,
          completionTokens: data?.usage?.completion_tokens,
        },
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      const errMsg = isTimeout
        ? 'Local Ollama request timed out after 15 seconds.'
        : 'AI service unavailable. Make sure Ollama is running locally on port 11434.';

      return {
        isUnavailable: true,
        error: errMsg,
        provider: `${this.name} (${this.model})`,
      };
    }
  }
}

export const OllamaProvider = LocalOllamaProvider;
