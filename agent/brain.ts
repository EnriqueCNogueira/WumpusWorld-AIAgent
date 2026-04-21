import { ChatGroq } from '@langchain/groq';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { WumpusWorldAPI } from '../src/infrastructure/api/WumpusWorldAPI';
import { SpatialMemory } from './memory';
import { buildTools } from './tools';
import { getSystemPrompt } from './prompt';

export function buildAgent(api: WumpusWorldAPI, memory: SpatialMemory, userDirective?: string) {  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY ausente no ambiente. Preencha em .env');

  const tools = buildTools(api, memory);
  const toolMap = new Map(tools.map(t => [t.name, t]));

  const llm = new ChatGroq({
    model: process.env.AGENT_MODEL ?? 'llama-3.1-8b-instant',
    temperature: 0,
    apiKey
  });

  const llmWithTools = llm.bindTools(tools);

  return {
    invoke: async (userInput: string): Promise<string> => {
      const response = await llmWithTools.invoke([
        new SystemMessage(getSystemPrompt(userDirective)),
        new HumanMessage(userInput)
      ]);

      const thought = typeof response.content === 'string' ? response.content : '';
      const toolCall = (response as any).tool_calls?.[0];

      if (!toolCall) return thought;

      const tool = toolMap.get(toolCall.name);
      if (!tool) return `${thought}\n[Erro: Ferramenta ${toolCall.name} desconhecida]`;

      const result = await (tool as any).invoke(toolCall.args);
      // Retornamos o pensamento + o log da ferramenta para que o command.ts possa ler a tag
      return `${thought}\n[${toolCall.name}] → ${result}`;
    }
  };
}