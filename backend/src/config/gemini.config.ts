import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const GEMINI_MODELS = {
  'gemini-2.5-flash': { name: 'Gemini 2.5 Flash', category: 'cheap', description: 'Ultra rápido e econômico' },
  'gemini-3-flash': { name: 'Gemini 3 Flash', category: 'medium', description: 'Balanceado e eficiente' },
  'gemini-3-pro': { name: 'Gemini 3 Pro', category: 'expensive', description: 'Máxima capacidade' },
};

export default genAI;
