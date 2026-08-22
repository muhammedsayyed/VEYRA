const { buildSystemPrompt } = require('./serverAIHelper.cjs');

class CloudAIProvider {
  constructor() {
    this.name = 'Production Cloud AI Provider';
    this.baseUrl = process.env.VEYRA_AI_CLOUD_BASE_URL || 'https://openrouter.ai/api/v1';
    this.apiKey = process.env.VEYRA_AI_CLOUD_API_KEY || process.env.OPENROUTER_API_KEY || '';
    this.model = process.env.VEYRA_AI_CLOUD_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free';
  }

  async generateChatResponse(messages, context) {
    const startTime = Date.now();
    const systemPrompt = buildSystemPrompt(context);

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const candidateModels = [
      'google/gemini-2.0-flash-lite-preview-02-05:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'qwen/qwen-2.5-coder-32b-instruct:free',
      'deepseek/deepseek-r1:free',
      'openai/gpt-oss-20b:free',
    ];

    let lastError = 'Cloud AI model service error.';

    for (const targetModel of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(`${this.baseUrl}/chat/completions`, {
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
            max_tokens: 450,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          lastError = errJson?.error?.message || `Model ${targetModel} returned status ${res.status}`;
          continue;
        }

        const data = await res.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        const text = typeof rawContent === 'string' ? rawContent.trim() : '';

        if (!text) {
          lastError = `Empty response returned from model ${targetModel}`;
          continue;
        }

        return {
          message: text,
          conversationId: `conv_cloud_${Date.now()}`,
          provider: `OpenRouter (${targetModel})`,
          latencyMs: Date.now() - startTime,
        };
      } catch (err) {
        lastError = err.message || 'Connection error';
      }
    }

    return {
      isUnavailable: true,
      error: `All Cloud AI models failed. Last error: ${lastError}`,
      provider: `cloud/${this.model}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

module.exports = { CloudAIProvider };
