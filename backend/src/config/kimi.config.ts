import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const KIMI_API_URL = 'https://api.moonshot.cn/v1';

export const kimiClient = axios.create({
  baseURL: KIMI_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Modelos Kimi/Moonshot AI (2026)
export const KIMI_MODELS = {
  'moonshot-k2.5': { name: 'Kimi K2.5', category: 'expensive', description: 'Modelo flagship multimodal' },
  'moonshot-k2.5-thinking': { name: 'Kimi K2.5 Thinking', category: 'expensive', description: 'Com raciocínio avançado' },
  'moonshot-k2': { name: 'Kimi K2', category: 'medium', description: 'Versão anterior estável' },
  'moonshot-v1-128k': { name: 'Kimi 128K', category: 'cheap', description: 'Contexto longo econômico' },
};

export default kimiClient;
