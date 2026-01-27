import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiConfig {
  apiKey: string;
  model: string;
}

interface QueryResult {
  response: string;
  tokensUsed: number;
  estimatedCostCentavos: number;
}

class GeminiService {
  private client: GoogleGenerativeAI | null = null;
  private config: GeminiConfig | null = null;

  initialize(apiKey: string, model: string = 'gemini-pro') {
    this.config = { apiKey, model };
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async query(prompt: string, context: string): Promise<QueryResult> {
    if (!this.client || !this.config) {
      throw new Error('Gemini service not initialized');
    }

    const model = this.client.getGenerativeModel({ model: this.config.model });
    
    const fullPrompt = `${context}\n\nUsuário: ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    
    // Estimativa de tokens (Gemini não retorna uso exato)
    const tokensUsed = this.estimateTokens(prompt + context + response.text());
    const estimatedCostCentavos = this.calculateCost(this.config.model, tokensUsed);

    return {
      response: response.text(),
      tokensUsed,
      estimatedCostCentavos
    };
  }

  private estimateTokens(text: string): number {
    // Estimativa: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }

  private calculateCost(model: string, tokens: number): number {
    // Custos em centavos por 1000 tokens
    const costPer1kTokens: Record<string, number> = {
      'gemini-pro': 15,          // R$ 0.15 por 1k tokens (cheap)
      'gemini-pro-vision': 25,   // R$ 0.25 por 1k tokens (cheap)
      'gemini-ultra': 200        // R$ 2.00 por 1k tokens (expensive)
    };

    const costPerToken = (costPer1kTokens[model] || 15) / 1000;
    return Math.round(tokens * costPerToken);
  }

  getModelCategory(model: string): 'cheap' | 'medium' | 'expensive' {
    if (model.includes('ultra')) {
      return 'expensive';
    }
    return 'cheap';
  }
}

export const geminiService = new GeminiService();
