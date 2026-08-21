import { IServerAIProvider } from '../../src/services/ai/serverAIProvider';
import { LocalOllamaProvider } from '../../src/services/ai/ollamaProvider';
import { CloudAIProvider } from '../../src/services/ai/cloudAIProvider';

export const config = {
  runtime: 'edge',
};

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function selectServerAIProvider(): IServerAIProvider {
  const providerType = (process.env.VEYRA_AI_PROVIDER || '').toLowerCase().trim();
  const isVercel = Boolean(
    process.env.VERCEL === '1' ||
    process.env.VERCEL ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.NODE_ENV === 'production'
  );

  // In production / Vercel deployment, ALWAYS use CloudAIProvider.
  // LocalOllamaProvider is strictly forbidden in Vercel serverless environments.
  if (isVercel || providerType === 'cloud' || providerType !== 'ollama') {
    return new CloudAIProvider();
  }

  return new LocalOllamaProvider();
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
  }

  try {
    const { messages, userContext } = await req.json().catch(() => ({}));
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Missing messages array in request body' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const provider = selectServerAIProvider();
    const result = await provider.generateChatResponse(messages, userContext);

    const httpStatus = result?.isUnavailable ? 503 : 200;

    return new Response(JSON.stringify(result), {
      status: httpStatus,
      headers: CORS_HEADERS,
    });
  } catch (error: any) {
    console.error('API /api/ai/chat error:', error);
    const errorMessage = error?.message || 'Failed to process AI request';

    return new Response(
      JSON.stringify({
        content: `I'm having trouble connecting to my AI core. Error: ${errorMessage}`,
        error: errorMessage,
        isUnavailable: true,
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

