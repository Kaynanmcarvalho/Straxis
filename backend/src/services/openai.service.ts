import OpenAI from 'openai';

interface OpenAIConfig {
  apiKey: string;
  model: string;
}

interface QueryResult {
  response: string;
  tokensUsed: number;
  estimatedCostCentavos: number;
}

class OpenAIService {
  private client: OpenAI | null = null;
  private config: OpenAIConfig | null = null;

  initialize(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.config = { apiKey, model };
    this.client = new OpenAI({ apiKey });
  }

  async query(prompt: string, context: string): Promise<QueryResult> {
    if (!this.client || !this.config) {
      throw new Error('OpenAI service not initialized');
    }

    const completion = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const tokensUsed = completion.usage?.total_tokens || 0;
    const estimatedCostCentavos = this.calculateCost(this.config.model, tokensUsed);

    return {
      response: completion.choices[0]?.message?.content || '',
      tokensUsed,
      estimatedCostCentavos
    };
  }

  private calculateCost(model: string, tokens: number): number {
    // Custos em centavos por 1000 tokens
    const costPer1kTokens: Record<string, number> = {
      'gpt-3.5-turbo': 20,      // R$ 0.20 por 1k tokens (cheap)
      'gpt-4': 300,              // R$ 3.00 por 1k tokens (expensive)
      'gpt-4-turbo': 100         // R$ 1.00 por 1k tokens (medium)
    };

    const costPerToken = (costPer1kTokens[model] || 20) / 1000;
    return Math.round(tokens * costPerToken);
  }

  getModelCategory(model: string): 'cheap' | 'medium' | 'expensive' {
    if (model.includes('gpt-4') && !model.includes('turbo')) {
      return 'expensive';
    }
    if (model.includes('gpt-4-turbo')) {
      return 'medium';
    }
    return 'cheap';
  }
}

export const openaiService = new OpenAIService();
