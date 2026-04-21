import 'dotenv/config';
import { createGame, describeWorld } from './bootstrap';
import { buildAgent } from './brain';

const MAX_TURNS = 50;

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error('ERRO: GOOGLE_API_KEY ausente. Crie um arquivo .env com a chave.');
    process.exit(1);
  }

  const seedEnv = process.env.AGENT_SEED;
  const useFixed = process.env.AGENT_FIXED === '1';
  const seed = seedEnv ? Number(seedEnv) : undefined;

  const { api, memory, world } = createGame({ seed, fixed: useFixed });

  console.log('='.repeat(60));
  console.log('WUMPUS WORLD — Agente LangChain.js');
  console.log('='.repeat(60));
  console.log('Mundo:', describeWorld(world));
  console.log('Seed :', seed ?? '(aleatório)');
  console.log('='.repeat(60));

  const agent = buildAgent(api, memory);

  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    const state = api.getPlayerState();
    if (!state.isAlive) {
      console.log(`\n💀 MORTO em (${state.position.x},${state.position.y}) após ${turn - 1} turnos.`);
      return;
    }
    if (state.isWinner) {
      console.log(`\n🏆 VITÓRIA no turno ${turn - 1}!`);
      return;
    }

    const perceptions = api.getPerceptions();
    const stuckWarning = memory.isStuck()
      ? '\n⚠️ ALERTA TÁTICO: Você está visitando as mesmas células. Mude de direção e explore fronteiras inexploradas.'
      : '';

    const userInput = [
      `Turno ${turn}`,
      '--- MEMÓRIA ESPACIAL ---',
      memory.render(state.position),
      '--- ESTADO ---',
      `Vivo: ${state.isAlive} | Ouro: ${state.hasGold} | Flechas: ${state.arrows} | Direção última: ${state.direction}`,
      `Percepções deste turno: ${perceptions.length ? perceptions.join(', ') : 'nenhuma'}`,
      stuckWarning
    ].filter(Boolean).join('\n');

    console.log(`\n━━━ Turno ${turn} ━━━`);
    console.log(userInput);

    try {
      const result = await agent.invoke({
        messages: [{ role: 'user', content: userInput }]
      });
      const last = result.messages[result.messages.length - 1];
      const content = typeof last?.content === 'string'
        ? last.content
        : JSON.stringify(last?.content);
      console.log(`\n[Agente] ${content}`);
    } catch (err) {
      console.error('Erro na invocação do agente:', err);
      return;
    }
  }

  console.log(`\n⏱️  Limite de ${MAX_TURNS} turnos atingido.`);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
