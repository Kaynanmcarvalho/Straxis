import { apiService } from './api.service';

export interface IAConfig {
  enabled: boolean;
  provider: 'openai' | 'gemini' | 'openrouter' | 'kimi' | 'local';
  localProvider?: 'lmstudio' | 'ollama' | 'huggingface';
  localServerUrl?: string;
  model: string;
  autoResponse: boolean;
  costLimit: number;
  antiHallucination: boolean;
}

export interface IAUsage {
  requestsToday: number;
  costToday: number;
  requestsMonth: number;
  costMonth: number;
}

class IAService {
  private baseUrl = '/ia';

  async getConfig(): Promise<IAConfig> {
    try {
      const response = await apiService.get<{ data: IAConfig }>(`${this.baseUrl}/config`);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar config IA:', error);
      // Retornar config padrão se API falhar
      return {
        enabled: true,
        provider: 'openai',
        autoResponse: true,
        costLimit: 100,
        antiHallucination: true,
      };
    }
  }

  async updateConfig(config: Partial<IAConfig>): Promise<void> {
    await apiService.put(`${this.baseUrl}/config`, config);
  }

  async getUsage(): Promise<IAUsage> {
    try {
      const response = await apiService.get<{ data: IAUsage }>(`${this.baseUrl}/usage`);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar usage IA:', error);
      // Retornar usage zerado se API falhar
      return {
        requestsToday: 0,
        costToday: 0,
        requestsMonth: 0,
        costMonth: 0,
      };
    }
  }
}

export const iaService = new IAService();


// Função para buscar modelos disponíveis de IA local
export async function fetchLocalModels(
  localProvider: 'lmstudio' | 'ollama' | 'huggingface',
  serverUrl?: string
): Promise<any[]> {
  try {
    const response = await apiService.post<{ data: any[] }>('/ia/local/models', {
      provider: localProvider,
      serverUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar modelos locais:', error);
    return [];
  }
}

// Função para verificar saúde do servidor local
export async function checkLocalServerHealth(
  localProvider: 'lmstudio' | 'ollama',
  serverUrl?: string
): Promise<boolean> {
  try {
    const response = await apiService.post<{ data: { healthy: boolean } }>('/ia/local/health', {
      provider: localProvider,
      serverUrl,
    });
    return response.data.healthy;
  } catch (error) {
    console.error('Erro ao verificar servidor local:', error);
    return false;
  }
}
