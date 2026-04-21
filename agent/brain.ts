import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { WumpusWorldAPI } from '../src/infrastructure/api/WumpusWorldAPI';
import { SpatialMemory } from './memory';
import { buildTools } from './tools';
import { SYSTEM_PROMPT } from './prompt';

// @langchain/langgraph/prebuilt usa subpath exports incompatíveis com moduleResolution:node (CommonJS).
// require() contorna o problema de resolução sem afetar o runtime (Node.js entende exports).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createReactAgent } = require('@langchain/langgraph/prebuilt') as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createReactAgent: (params: Record<string, any>) => any;
};

export function buildAgent(api: WumpusWorldAPI, memory: SpatialMemory) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY ausente no ambiente. Preencha em .env');
  }

  const llm = new ChatGoogleGenerativeAI({
    model: process.env.AGENT_MODEL ?? 'gemini-2.0-flash',
    temperature: 0,
    apiKey
  });

  return createReactAgent({
    llm,
    tools: buildTools(api, memory),
    prompt: SYSTEM_PROMPT
  });
}
