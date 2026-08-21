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

      const data = await response.json().catch(() => null);

      if (response.ok && data) {
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

      if (data) {
        return {
          text: data.error || data.content || data.message || `AI service unavailable (HTTP ${response.status}).`,
          provider: data.provider || 'veyra-backend (service error)',
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
