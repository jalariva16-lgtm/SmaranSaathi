import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', // Also supports 'qwen/qwen3-32b', 'llama-3.3-70b-versatile'
    baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  },
  hindsight: {
    baseUrl: process.env.HINDSIGHT_BASE_URL || 'http://localhost:8888',
    apiKey: process.env.HINDSIGHT_API_KEY || '',
    timeoutMs: parseInt(process.env.HINDSIGHT_TIMEOUT_MS || '4000', 10),
  },
  dbPath: path.resolve(__dirname, '../../data/supportmemory.json'),
  hindsightStorePath: path.resolve(__dirname, '../../data/hindsight_store.json'),
};
