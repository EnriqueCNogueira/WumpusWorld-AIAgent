import 'dotenv/config';
import { createGame, describeWorld } from './bootstrap';
import { buildAgent } from './brain';

const MAX_TURNS = 50;
const MAX_RETRIES = 6;

// llama-3.1-8b-instant no plano free: ~6000 RPM / 30000 TPM → folga confortável.
const INTER_TURN_DELAY_MS = 3000;

// Backoff fixo para 429; exponential capped at 60s.
const BACKOFF_BASE: Record<number, number> = { 503: 2000, 429: 10000 };
const BACKOFF_MAX_MS = 60000;

function isTransient(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  if (e['status'] === 429 || e['status'] === 503) return true;
  // LangChain/p-retry pode encapsular o erro original
  if (e['error'] && typeof e['error'] === 'object') {
    const inner = e['error'] as Record<string, unknown>;
    if (inner['status'] === 429 || inner['status'] === 503) return true;
  }
  const msg = String(e['message'] ?? '').toLowerCase();
  return msg.includes('rate limit') || msg.includes('rate_limit') ||
         msg.includes('429') || msg.includes('too many') ||
         msg.includes('overloaded');
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function invokeWithRetry(agent: { invoke: (s: string) => Promise<string> }, input: string): Promise<string> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await agent.invoke(input);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (isTransient(err) && attempt < MAX_RETRIES) {
        const base = BACKOFF_BASE[status ?? 503] ?? 2000;
        const delay = Math.min(base * Math.pow(2, attempt), BACKOFF_MAX_MS);
        console.warn(
          `  [HTTP ${status}] ${status === 429 ? 'Rate limit' : 'Serviço indisponível'}` +
          ` — tentativa ${attempt + 1}/${MAX_RETRIES} em ${delay / 1000}s...`
        );
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw new Error('invokeWithRetry: tentativas esgotadas');
}

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error('ERRO: GROQ_API_KEY ausente. Crie um arquivo .env com a chave.');
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
      const result = await invokeWithRetry(agent, userInput);
      console.log(`\n[Agente] ${result}`);

      // Pausa entre turnos para respeitar o rate limit do plano gratuito
      if (turn < MAX_TURNS) await sleep(INTER_TURN_DELAY_MS);
    } catch (err: unknown) {
      if (isTransient(err)) {
        console.error(`\nErro: modelo indisponível após ${MAX_RETRIES} tentativas. Tente novamente em alguns minutos.`);
      } else {
        console.error('Erro na invocação do agente:', err);
      }
      return;
    }
  }

  console.log(`\n⏱️  Limite de ${MAX_TURNS} turnos atingido.`);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
