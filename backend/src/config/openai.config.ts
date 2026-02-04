import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_MODELS = {
  'gpt-4.1': { name: 'GPT-4.1', category: 'expensive', description: 'Mais avançado e preciso' },
  'gpt-4.1-mini': { name: 'GPT-4.1 Mini', category: 'medium', description: 'Balanceado custo/performance' },
  'gpt-4.1-nano': { name: 'GPT-4.1 Nano', category: 'cheap', description: 'Rápido e econômico' },
  'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', category: 'cheap', description: 'Legado econômico' },
};

export default openai;
