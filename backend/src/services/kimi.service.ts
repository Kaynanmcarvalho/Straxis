import { kimiClient, KIMI_MODELS } from '../config/kimi.config';

interface QueryResult {
  response: string;
  tokensUsed: number;
  estimatedCostCentavos: number;
}

class KimiService {
  async query(prompt: string, context: string, model: string = 'moonshot-v1-128k'): Promise<QueryResult> {
    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      throw new Error('Kimi API key not configured');
    }

    console.log(`[Kimi] 🌙 Modelo: ${model}`);

    const response = await kimiClient.post('/chat/completions', {
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

    console.log(`[Kimi] ✅ Tokens: ${tokensUsed}`);

    return {
      response: completion,
      tokensUsed,
      estimatedCostCentavos,
    };
  }

  private calculateCost(model: string, tokens: number): number {
    const costMap: Record<string, number> = {
      'expensive': 200,
      'medium': 40,
      'cheap': 10,
    };

    const modelInfo = KIMI_MODELS[model as keyof typeof KIMI_MODELS];
    const category = modelInfo?.category || 'medium';
    const costPerToken = (costMap[category] || 40) / 1000;
    return Math.round(tokens * costPerToken);
  }

  getModelCategory(model: string): 'cheap' | 'medium' | 'expensive' {
    const modelInfo = KIMI_MODELS[model as keyof typeof KIMI_MODELS];
    return (modelInfo?.category as 'cheap' | 'medium' | 'expensive') || 'medium';
  }

  getAvailableModels(): { id: string; name: string; category: string; description: string }[] {
    return Object.entries(KIMI_MODELS).map(([id, info]) => ({
      id,
      ...info,
    }));
  }
}

export const kimiService = new KimiService();
