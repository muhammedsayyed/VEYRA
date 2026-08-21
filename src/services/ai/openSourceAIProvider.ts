import { VeyraUserContext } from './aiContext';
import { VeyraAIResponse } from './aiProvider';

/**
 * OpenSourceAIProvider (Client Side)
 * Sends conversation requests to Veyra Backend (/api/ai/chat).
 * NEVER connects directly to Ollama or exposes internal model configuration.
 */
export class OpenSourceAIProvider {
  name = 'Veyra Open-Source AI Provider';
  private endpoint =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_VEYRA_AI_ENDPOINT) ||
    '/api/ai/chat';

  async queryAI(
    message: string,
    context: VeyraUserContext,
    history: Array<{ role: 'user' | 'ai'; text: string }> = []
  ): Promise<VeyraAIResponse> {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Format conversation history for API payload
    const formattedMessages = [
      ...history.map((h) => ({
        role: h.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: h.text,
      })),
      { role: 'user' as const, content: message },
    ];

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages,
          userContext: context,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.isUnavailable) {
          return {
            text: data.error || 'AI service is currently unavailable. Please check your cloud AI configuration.',
            provider: data.provider || 'veyra-backend (unavailable)',
            timestamp,
            isUnavailable: true,
          };
        }

        if (data.message || data.text) {
          return {
            text: data.message || data.text,
            provider: data.provider || 'OpenRouter (via Veyra Backend)',
            timestamp,
            conversationId: data.conversationId,
            isUnavailable: false,
          };
        }
      }

      if (response.status === 503 || response.status === 500) {
        const errData = await response.json().catch(() => ({}));
        return {
          text: errData.error || errData.content || 'AI service unavailable. Cloud AI model service error.',
          provider: errData.provider || 'veyra-backend (error)',
          timestamp,
          isUnavailable: true,
        };
      }
    } catch (err: any) {
      console.warn('[OpenSourceAIProvider] Veyra AI backend query notice:', err);
    }

    return {
      text: 'AI service unavailable. Could not reach Veyra backend AI endpoint.',
      provider: 'veyra-backend (network error)',
      timestamp,
      isUnavailable: true,
    };
  }
}
