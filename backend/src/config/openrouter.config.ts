import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

export const openrouterClient = axios.create({
  baseURL: OPENROUTER_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://straxis.app',
    'X-Title': 'Straxis SaaS',
    'Content-Type': 'application/json',
  },
});

// Modelos disponíveis no OpenRouter (2026)
export const OPENROUTER_MODELS = {
  // OpenAI via OpenRouter
  'openai/gpt-4.1': { name: 'GPT-4.1 (OpenRouter)', category: 'expensive', description: 'OpenAI GPT-4.1 via OpenRouter' },
  'openai/gpt-4.1-mini': { name: 'GPT-4.1 Mini (OpenRouter)', category: 'medium', description: 'Balanceado via OpenRouter' },
  'openai/gpt-4.1-nano': { name: 'GPT-4.1 Nano (OpenRouter)', category: 'cheap', description: 'Econômico via OpenRouter' },
  
  // Anthropic via OpenRouter
  'anthropic/claude-opus-4.5': { name: 'Claude Opus 4.5', category: 'expensive', description: 'Mais avançado da Anthropic' },
  'anthropic/claude-sonnet-4.5': { name: 'Claude Sonnet 4.5', category: 'medium', description: 'Balanceado Anthropic' },
  
  // Google via OpenRouter
  'google/gemini-2.5-flash': { name: 'Gemini 2.5 Flash (OpenRouter)', category: 'cheap', description: 'Google via OpenRouter' },
  'google/gemini-3-pro': { name: 'Gemini 3 Pro (OpenRouter)', category: 'expensive', description: 'Google Pro via OpenRouter' },
  
  // Meta via OpenRouter
  'meta-llama/llama-4-405b': { name: 'Llama 4 405B', category: 'expensive', description: 'Meta Llama 4 grande' },
  'meta-llama/llama-4-70b': { name: 'Llama 4 70B', category: 'medium', description: 'Meta Llama 4 médio' },
  
  // Mistral via OpenRouter
  'mistralai/mistral-large-2': { name: 'Mistral Large 2', category: 'medium', description: 'Mistral avançado' },
  
  // DeepSeek via OpenRouter
  'deepseek/deepseek-v3': { name: 'DeepSeek V3', category: 'cheap', description: 'DeepSeek econômico' },
};

export default openrouterClient;
