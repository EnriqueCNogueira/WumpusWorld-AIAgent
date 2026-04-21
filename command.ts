import 'dotenv/config';
import * as readline from 'readline';
import { createGame } from './agent/bootstrap';
import { buildAgent } from './agent/brain';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (query: string) => new Promise<string>(resolve => rl.question(query, resolve));

async function main() {
  const { api, memory } = createGame({ fixed: process.env.AGENT_FIXED === '1' });
  console.log("=== MODO COMANDO INTERATIVO ATIVO ===");

  while (true) {
    const state = api.getPlayerState();
    
    if (!state.isAlive) {
      console.log(`\n💀 FIM DE JOGO: Agente morto na posição [${state.position.x}, ${state.position.y}].`);
      break;
    }
    if (state.isWinner) {
      console.log(`\n🏆 FIM DE JOGO: Agente venceu a partida!`);
      break;
    }

    const directive = await ask('\nComando (ou "sair"): ');
    if (directive.toLowerCase() === 'sair') break;

    let orderActive = true;
    let actionHistory: string[] = [];

    while (orderActive) {
      const currentState = api.getPlayerState();
      
      if (!currentState.isAlive || currentState.isWinner) {
        break; 
      }

      const agent = buildAgent(api, memory, directive);
      
      const userInput = [
        `Histórico de Ações executadas nesta ordem: ${actionHistory.length > 0 ? actionHistory.join(' -> ') : 'Nenhuma ainda'}`,
        `Memória:\n${memory.render(currentState.position)}`,
        `Percepções: ${api.getPerceptions().join(', ')}`
      ].join('\n');

      try {
        const response = await agent.invoke(userInput);
        console.log(`[Agente]: ${response}`);

        if (response.includes('CONCLUIDO') || !response.includes('[')) {
          orderActive = false; 
        } else {
          const actionMatch = response.match(/\[(.*?)\]/);
          if (actionMatch) {
            actionHistory.push(actionMatch[1]);
          }
        }
      } catch (err) {
        console.error("Erro na execução:", err instanceof Error ? err.message : err);
        orderActive = false; // Devolve o controle se der erro
      }
    }
  }

  console.log("\nSessão encerrada.");
  process.exit(0);
}

main();