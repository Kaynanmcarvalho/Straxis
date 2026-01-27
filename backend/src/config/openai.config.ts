import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_MODELS = {
  cheap: ['gpt-3.5-turbo'],
  medium: ['gpt-4'],
  expensive: ['gpt-4-turbo', 'gpt-4-turbo-preview'],
};

export default openai;
