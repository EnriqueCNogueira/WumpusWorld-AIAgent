import { ChatGroq } from '@langchain/groq';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { WumpusWorldAPI } from '../src/infrastructure/api/WumpusWorldAPI';
import { SpatialMemory } from './memory';
import { buildTools } from './tools';
import { SYSTEM_PROMPT } from './prompt';

export function buildAgent(api: WumpusWorldAPI, memory: SpatialMemory) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY ausente no ambiente. Preencha em .env');

  const tools = buildTools(api, memory);
  const toolMap = new Map(tools.map(t => [t.name, t]));

  const llm = new ChatGroq({
    model: process.env.AGENT_MODEL ?? 'llama-3.1-8b-instant',
    temperature: 0,
    apiKey
  });

  // bindTools: LLM retorna uma tool_call; executamos localmente sem 2ª chamada.
  const llmWithTools = llm.bindTools(tools);

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invoke: async (userInput: string): Promise<string> => {
      const response = await llmWithTools.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(userInput)
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toolCall = (response as any).tool_calls?.[0];
      if (!toolCall) {
        return typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);
      }

      const tool = toolMap.get(toolCall.name);
      if (!tool) return `[Ferramenta desconhecida: ${toolCall.name}]`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (tool as any).invoke(toolCall.args);
      return `[${toolCall.name}(${JSON.stringify(toolCall.args)})] → ${result}`;
    }
  };
}
