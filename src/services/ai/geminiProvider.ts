import { VeyraUserContext } from './aiContext';
import { currentAIProvider, VeyraAIResponse } from './aiProvider';

export type GeminiResponse = VeyraAIResponse;

/**
 * Compatibility wrapper routing to Veyra Open-Source AI Provider.
 */
export async function askGemini(
  message: string,
  userContext: VeyraUserContext,
  conversationHistory: Array<{ role: 'user' | 'ai'; text: string }> = []
): Promise<VeyraAIResponse> {
  return await currentAIProvider.queryAI(message, userContext, conversationHistory);
}
