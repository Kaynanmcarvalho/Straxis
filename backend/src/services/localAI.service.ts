import { 
  lmStudioClient, 
  ollamaClient, 
  huggingfaceClient,
  LocalAIProvider,
  fetchLMStudioModels,
  fetchOllamaModels,
  checkLocalServerHealth
} from '../config/local-ai.config';

interface LocalAIQueryResult {
  response: string;
  tokensUsed: number;
  estimatedCostCentavos: number;
  provider: LocalAIProvider;
  model: string;
}

class LocalAIService {
  /**
   * Processar query com LM Studio
   */
  async queryLMStudio(
    message: string,
    context: string,
    model: string,
    serverUrl?: string
  ): Promise<LocalAIQueryResult> {
    const client = lmStudioClient(serverUrl);
    
    try {
      const response = await client.post('/v1/chat/completions', {
        model: model,
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const completion = response.data.choices[0].message.content;
      const tokensUsed = response.data.usage?.total_tokens || 0;

      return {
        response: completion,
        tokensUsed,
        estimatedCostCentavos: 0, // Local = grátis
        provider: 'lmstudio',
        model,
      };
    } catch (error: any) {
      throw new Error(`LM Studio error: ${error.message}`);
    }
  }

  /**
   * Processar query com Ollama
   */
  async queryOllama(
    message: string,
    context: string,
    model: string,
    serverUrl?: string
  ): Promise<LocalAIQueryResult> {
    const client = ollamaClient(serverUrl);
    
    try {
      const response = await client.post('/api/chat', {
        model: model,
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: message }
        ],
        stream: false,
      });

      const completion = response.data.message.content;
      const tokensUsed = response.data.eval_count || 0;

      return {
        response: completion,
        tokensUsed,
        estimatedCostCentavos: 0, // Local = grátis
        provider: 'ollama',
        model,
      };
    } catch (error: any) {
      throw new Error(`Ollama error: ${error.message}`);
    }
  }

  /**
   * Processar query com Hugging Face
   */
  async queryHuggingFace(
    message: string,
    context: string,
    model: string
  ): Promise<LocalAIQueryResult> {
    try {
      const prompt = `${context}\n\nUser: ${message}\nAssistant:`;
      
      const response = await huggingfaceClient.post(`/models/${model}`, {
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          return_full_text: false,
        },
      });

      let completion = '';
      if (Array.isArray(response.data)) {
        completion = response.data[0]?.generated_text || '';
      } else {
        completion = response.data.generated_text || '';
      }

      // Hugging Face não retorna token count diretamente
      const estimatedTokens = Math.ceil(completion.length / 4);

      return {
        response: completion,
        tokensUsed: estimatedTokens,
        estimatedCostCentavos: 0, // Inference API gratuita (com rate limit)
        provider: 'huggingface',
        model,
      };
    } catch (error: any) {
      throw new Error(`Hugging Face error: ${error.message}`);
    }
  }

  /**
   * Buscar modelos disponíveis
   */
  async getAvailableModels(provider: LocalAIProvider, serverUrl?: string): Promise<any[]> {
    try {
      if (provider === 'lmstudio') {
        return await fetchLMStudioModels(serverUrl);
      } else if (provider === 'ollama') {
        return await fetchOllamaModels(serverUrl);
      } else if (provider === 'huggingface') {
        // Retornar lista de modelos populares (HF tem milhões de modelos)
        const { LOCAL_AI_MODELS } = await import('../config/local-ai.config');
        return LOCAL_AI_MODELS.huggingface.popular;
      }
      return [];
    } catch (error) {
      console.error(`Erro ao buscar modelos ${provider}:`, error);
      return [];
    }
  }

  /**
   * Verificar saúde do servidor local
   */
  async checkHealth(provider: LocalAIProvider, serverUrl?: string): Promise<boolean> {
    return await checkLocalServerHealth(provider, serverUrl);
  }

  /**
   * Processar query (método unificado)
   */
  async processQuery(
    message: string,
    context: string,
    provider: LocalAIProvider,
    model: string,
    serverUrl?: string
  ): Promise<LocalAIQueryResult> {
    switch (provider) {
      case 'lmstudio':
        return await this.queryLMStudio(message, context, model, serverUrl);
      case 'ollama':
        return await this.queryOllama(message, context, model, serverUrl);
      case 'huggingface':
        return await this.queryHuggingFace(message, context, model);
      default:
        throw new Error(`Provedor não suportado: ${provider}`);
    }
  }
}

export const localAIService = new LocalAIService();
