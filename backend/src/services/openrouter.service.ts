import { openrouterClient, OPENROUTER_MODELS } from '../config/openrouter.config';

interface QueryResult {
  response: string;
  tokensUsed: number;
  estimatedCostCentavos: number;
}

class OpenRouterService {
  async query(prompt: string, context: string, model: string = 'openai/gpt-4.1-mini'): Promise<QueryResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    console.log(`[OpenRouter] 🌐 Modelo: ${model}`);

    const response = await openrouterClient.post('/chat/completions', {
      model,
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const completion = response.data.choices?.[0]?.message?.content || '';
    const tokensUsed = response.data.usage?.total_tokens || 0;
    const estimatedCostCentavos = this.calculateCost(model, tokensUsed);

    console.log(`[OpenRouter] ✅ Tokens: ${tokensUsed}`);

    return {
      response: completion,
      tokensUsed,
      estimatedCostCentavos,
    };
  }

  private calculateCost(model: string, tokens: number): number {
    // Custos em centavos por 1000 tokens (estimativa)
    const costMap: Record<string, number> = {
      'expensive': 300,
      'medium': 50,
      'cheap': 15,
    };

    const modelInfo = OPENROUTER_MODELS[model as keyof typeof OPENROUTER_MODELS];
    const category = modelInfo?.category || 'medium';
    const costPerToken = (costMap[category] || 50) / 1000;
    return Math.round(tokens * costPerToken);
  }

  getModelCategory(model: string): 'cheap' | 'medium' | 'expensive' {
    const modelInfo = OPENROUTER_MODELS[model as keyof typeof OPENROUTER_MODELS];
    return (modelInfo?.category as 'cheap' | 'medium' | 'expensive') || 'medium';
  }

  getAvailableModels(): { id: string; name: string; category: string; description: string }[] {
    return Object.entries(OPENROUTER_MODELS).map(([id, info]) => ({
      id,
      ...info,
    }));
  }
}

export const openrouterService = new OpenRouterService();
