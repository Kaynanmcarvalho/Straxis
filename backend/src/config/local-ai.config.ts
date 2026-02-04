import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// IA LOCAL - BETA v1
// Suporte a LM Studio, Ollama e Hugging Face
// ============================================

// LM Studio Configuration
export const LM_STUDIO_DEFAULT_URL = 'http://localhost:1234';
export const lmStudioClient = (baseURL?: string) => axios.create({
  baseURL: baseURL || process.env.LM_STUDIO_URL || LM_STUDIO_DEFAULT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s para modelos locais
});

// Ollama Configuration
export const OLLAMA_DEFAULT_URL = 'http://localhost:11434';
export const ollamaClient = (baseURL?: string) => axios.create({
  baseURL: baseURL || process.env.OLLAMA_URL || OLLAMA_DEFAULT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Hugging Face Configuration
export const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co';
export const huggingfaceClient = axios.create({
  baseURL: HUGGINGFACE_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Tipos de provedores locais
export type LocalAIProvider = 'lmstudio' | 'ollama' | 'huggingface';

// Interface para configuração de IA local
export interface LocalAIConfig {
  provider: LocalAIProvider;
  serverUrl?: string; // URL customizada (opcional)
  model: string;
}

// Modelos populares por provedor (exemplos)
export const LOCAL_AI_MODELS = {
  lmstudio: {
    // LM Studio usa modelos compatíveis com OpenAI API
    // Os modelos disponíveis são retornados pela API /v1/models
    description: 'Modelos carregados no LM Studio',
    endpoint: '/v1/models',
  },
  ollama: {
    // Ollama tem sua própria biblioteca de modelos
    popular: [
      { id: 'llama3.3:70b', name: 'Llama 3.3 70B', category: 'expensive' },
      { id: 'llama3.2:3b', name: 'Llama 3.2 3B', category: 'cheap' },
      { id: 'mistral:7b', name: 'Mistral 7B', category: 'medium' },
      { id: 'gemma2:9b', name: 'Gemma 2 9B', category: 'medium' },
      { id: 'phi4:14b', name: 'Phi 4 14B', category: 'medium' },
      { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', category: 'medium' },
      { id: 'deepseek-r1:7b', name: 'DeepSeek R1 7B', category: 'medium' },
    ],
    endpoint: '/api/tags', // Lista modelos instalados
  },
  huggingface: {
    // Hugging Face Inference API - modelos populares
    popular: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', category: 'expensive' },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B', category: 'medium' },
      { id: 'google/gemma-2-9b-it', name: 'Gemma 2 9B', category: 'medium' },
      { id: 'microsoft/Phi-4', name: 'Phi 4', category: 'medium' },
      { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B', category: 'medium' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', category: 'expensive' },
    ],
  },
};

// Função para buscar modelos disponíveis do LM Studio
export async function fetchLMStudioModels(serverUrl?: string): Promise<any[]> {
  try {
    const client = lmStudioClient(serverUrl);
    const response = await client.get('/v1/models');
    return response.data.data || [];
  } catch (error) {
    console.error('Erro ao buscar modelos LM Studio:', error);
    return [];
  }
}

// Função para buscar modelos disponíveis do Ollama
export async function fetchOllamaModels(serverUrl?: string): Promise<any[]> {
  try {
    const client = ollamaClient(serverUrl);
    const response = await client.get('/api/tags');
    return response.data.models || [];
  } catch (error) {
    console.error('Erro ao buscar modelos Ollama:', error);
    return [];
  }
}

// Função para verificar se servidor local está online
export async function checkLocalServerHealth(provider: LocalAIProvider, serverUrl?: string): Promise<boolean> {
  try {
    if (provider === 'lmstudio') {
      const client = lmStudioClient(serverUrl);
      await client.get('/v1/models');
      return true;
    } else if (provider === 'ollama') {
      const client = ollamaClient(serverUrl);
      await client.get('/api/tags');
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export default {
  lmStudioClient,
  ollamaClient,
  huggingfaceClient,
  fetchLMStudioModels,
  fetchOllamaModels,
  checkLocalServerHealth,
};
