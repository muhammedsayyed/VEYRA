import { IServerAIProvider } from '../../src/services/ai/serverAIProvider';
import { LocalOllamaProvider } from '../../src/services/ai/ollamaProvider';
import { CloudAIProvider } from '../../src/services/ai/cloudAIProvider';

export const config = {
  runtime: 'edge',
};

export function selectServerAIProvider(): IServerAIProvider {
  const providerType = (process.env.VEYRA_AI_PROVIDER || '').toLowerCase();

  if (providerType === 'cloud') {
    return new CloudAIProvider();
  }

  return new LocalOllamaProvider();
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { messages, userContext } = await req.json().catch(() => ({}));
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Missing messages array in request body' }), { status: 400 });
    }

    const provider = selectServerAIProvider();
    const result = await provider.generateChatResponse(messages, userContext);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API /api/ai/chat error:', error);
    const errorMessage = error?.message || 'Failed to process AI request';

    return new Response(
      JSON.stringify({
        content: `I'm having trouble connecting to my AI core. Error: ${errorMessage}`,
        error: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
