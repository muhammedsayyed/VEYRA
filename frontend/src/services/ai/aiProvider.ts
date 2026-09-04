import { VeyraUserContext } from './aiContext';
import { OpenSourceAIProvider } from './openSourceAIProvider';

export interface VeyraAIResponse {
  text: string;
  provider: string;
  timestamp: string;
  conversationId?: string;
  isUnavailable?: boolean;
}

export interface VeyraAIProvider {
  name: string;
  queryAI(
    message: string,
    context: VeyraUserContext,
    history?: Array<{ role: 'user' | 'ai'; text: string }>
  ): Promise<VeyraAIResponse>;
}

export { OpenSourceAIProvider };

// Active Veyra AI Provider instance
export const currentAIProvider: VeyraAIProvider = new OpenSourceAIProvider();
