import * as readline from 'readline';
import { WorldFactory } from './src/infrastructure/factories/WorldFactory';
import { GameEngine } from './src/application/engine/GameEngine';
import { WumpusWorldAPI } from './src/infrastructure/api/WumpusWorldAPI';
import { SensoryService } from './src/application/systems/SensoryService';
import { PerceptionType } from './src/domain/types/PerceptionType';
import { EntityType } from './src/domain/types/EntityType';
import { IEntity } from './src/domain/interfaces/IEntity';

// ─── ANSI helpers ────────────────────────────────────────────────────────────
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  bgRed:   '\x1b[41m',
  bgGreen: '\x1b[42m',
};

const clear = (): void => { process.stdout.write('\x1b[2J\x1b[H'); };

// ─── State types ─────────────────────────────────────────────────────────────
interface GameState {
  api: WumpusWorldAPI;
  entities: IEntity[];
  gridSize: number;
  visited: Map<string, Set<PerceptionType>>;
  turn: number;
  lastMessage: string;
  gameOver: boolean;
  revealed: boolean;
  awaitingShoot: boolean;
}

// ─── Initialise a fresh game ─────────────────────────────────────────────────
function initGame(): GameState {
  GameEngine.getInstance().clear();
  const world = WorldFactory.createRandomWorld({ gridSize: 4, pitProbability: 0.2 });
  const engine = GameEngine.getInstance();
  engine.initialize(world.gridSize, world.player, world.entities);
  const api = new WumpusWorldAPI();

  // Compute initial perceptions at start cell (0,0)
  new SensoryService(engine).updatePerceptions();

  const visited = new Map<string, Set<PerceptionType>>();
  visited.set('0,0', new Set(api.getPerceptions() as PerceptionType[]));

  return {
    api,
    entities: world.entities,
    gridSize: world.gridSize,
    visited,
    turn: 1,
    lastMessage: `${C.cyan}Voce acorda na entrada da caverna. Encontre o ouro e escape!${C.reset}`,
    gameOver: false,
    revealed: false,
    awaitingShoot: false,
  };
}

// ─── Cell content (always 5 visible chars) ───────────────────────────────────
function cellContent(x: number, y: number, state: GameState): string {
  const ps = state.api.getPlayerState();
  const key = `${x},${y}`;
  const isPlayer = ps.position.x === x && ps.position.y === y;

  // ── Game-over: reveal full map ──────────────────────────────────────────────
  if (state.revealed) {
    // Show player death position with an X-mark
    if (isPlayer && !ps.isAlive) return `${C.bold}${C.bgRed}  +  ${C.reset}`;

    const ent = state.entities.find(e => e.position.x === x && e.position.y === y);
    if (ent) {
      if (ent.type === EntityType.WUMPUS) {
        const alive = (ent as any).isAlive !== false;
        return alive
          ? `${C.bold}${C.red}  W  ${C.reset}`
          : `${C.dim}  w  ${C.reset}`;
      }
      if (ent.type === EntityType.PIT)  return `${C.bold}${C.blue}  X  ${C.reset}`;
      if (ent.type === EntityType.GOLD) return `${C.bold}${C.yellow}  $  ${C.reset}`;
    }
    if (x === 0 && y === 0) return `${C.green}  S  ${C.reset}`;
    return `${C.dim}  .  ${C.reset}`;
  }

  // ── Player icon ─────────────────────────────────────────────────────────────
  if (isPlayer) {
    const sym = ({ NORTH: '^', SOUTH: 'v', EAST: '>', WEST: '<' } as Record<string, string>)[ps.direction] ?? '?';
    return `${C.bold}${C.green}  ${sym}  ${C.reset}`;
  }

  // ── Fog of war ──────────────────────────────────────────────────────────────
  if (!state.visited.has(key)) return `${C.dim}  ?  ${C.reset}`;

  // ── Visited cell ────────────────────────────────────────────────────────────
  const p = state.visited.get(key)!;
  const st = p.has(PerceptionType.STENCH);
  const br = p.has(PerceptionType.BREEZE);
  const gl = p.has(PerceptionType.GLITTER);

  if (gl)      return `${C.bold}${C.yellow}  *  ${C.reset}`;
  if (st && br) return `${C.magenta} ~${C.cyan}=  ${C.reset}`;
  if (st)      return `${C.magenta}  ~  ${C.reset}`;
  if (br)      return `${C.cyan}  =  ${C.reset}`;
  if (x === 0 && y === 0) return `${C.green}  S  ${C.reset}`;
  return `${C.dim}  .  ${C.reset}`;
}

// ─── Full UI render ──────────────────────────────────────────────────────────
function render(state: GameState): void {
  clear();
  const ps = state.api.getPlayerState();
  const percs = state.api.getPerceptions() as PerceptionType[];
  const { gridSize } = state;

  // Title
  console.log();
  console.log(`${C.bold}${C.yellow}  ╔═════════════════════════════════════════╗`);
  console.log(`  ║       W U M P U S   W O R L D           ║`);
  console.log(`  ╚═════════════════════════════════════════╝${C.reset}`);
  console.log();

  // Status bar
  const arrowClr = ps.arrows > 0 ? C.cyan : C.red;
  const goldClr  = ps.hasGold ? C.yellow : C.dim;
  const goldMark = ps.hasGold ? '[OURO]' : 'sem ouro';
  console.log(
    `  ${arrowClr}Flechas: ${ps.arrows}${C.reset}` +
    `  |  ${goldClr}${goldMark}${C.reset}` +
    `  |  Turno: ${state.turn}` +
    `  |  Pos: (${ps.position.x},${ps.position.y})`
  );
  console.log();

  // Grid
  const seg  = '─────';
  const top    = '  ┌' + Array(gridSize).fill(seg).join('┬') + '┐';
  const mid    = '  ├' + Array(gridSize).fill(seg).join('┼') + '┤';
  const bottom = '  └' + Array(gridSize).fill(seg).join('┴') + '┘';

  // Column labels
  let colLabel = '     ';
  for (let x = 0; x < gridSize; x++) colLabel += `  ${x}    `;
  console.log(`${C.dim}${colLabel}${C.reset}`);

  console.log(top);
  for (let y = 0; y < gridSize; y++) {
    let row = `${C.dim}${y}${C.reset} │`;
    for (let x = 0; x < gridSize; x++) {
      row += cellContent(x, y, state) + '│';
    }
    console.log(row);
    if (y < gridSize - 1) console.log(mid);
  }
  console.log(bottom);
  console.log();

  // Perceptions this turn
  const percLabels: Record<string, string> = {
    STENCH:  `${C.magenta}Fedor${C.reset}`,
    BREEZE:  `${C.cyan}Brisa${C.reset}`,
    GLITTER: `${C.yellow}Brilho${C.reset}`,
    BUMP:    `Batida na parede`,
    SCREAM:  `${C.bold}${C.red}GRITO DO WUMPUS!${C.reset}`,
  };

  if (percs.length > 0) {
    const str = percs.map(p => percLabels[p] ?? p).join('   ');
    console.log(`  Percepcoes: ${str}`);
  } else {
    console.log(`  ${C.dim}Silencio total...${C.reset}`);
  }
  console.log();

  // Last event message
  console.log(`  ${state.lastMessage}`);
  console.log();

  // Controls
  if (state.awaitingShoot) {
    console.log(`  ${C.bold}${C.yellow}Atirar em qual direcao?${C.reset}`);
    console.log(`  [W] Norte  [S] Sul  [A] Oeste  [D] Leste  [Esc] Cancelar`);
  } else if (state.gameOver) {
    console.log(`  ${C.bold}[R]${C.reset} Novo Jogo     ${C.bold}[Q]${C.reset} Sair`);
  } else {
    const atExit = ps.position.x === 0 && ps.position.y === 0 && state.turn > 1;
    console.log(
      `  ${C.bold}[W/seta cima]${C.reset} Norte   ${C.bold}[S/seta baixo]${C.reset} Sul   ` +
      `${C.bold}[A/seta esq]${C.reset} Oeste   ${C.bold}[D/seta dir]${C.reset} Leste`
    );
    console.log(
      `  ${C.bold}[F]${C.reset} Atirar   ${C.bold}[G]${C.reset} Pegar Ouro   ` +
      `${C.bold}[E]${C.reset} Sair da Caverna   ${C.bold}[Q]${C.reset} Sair`
    );
    if (atExit) {
      console.log(`  ${C.dim}  -> Voce esta na saida! Pressione E para escalar.${C.reset}`);
    }
  }

  console.log();
  console.log(
    `  ${C.dim}Legenda (visitado): ^ v > < Jogador  S Saida  ~ Fedor  = Brisa  * Ouro  . Seguro  ? Neblina${C.reset}`
  );
  console.log(
    `  ${C.dim}Revelado ao morrer/vencer: W Wumpus  X Buraco  $ Ouro${C.reset}`
  );
}

// ─── Record visited cell with current perceptions ────────────────────────────
function record(state: GameState): void {
  const ps = state.api.getPlayerState();
  const key = `${ps.position.x},${ps.position.y}`;
  state.visited.set(key, new Set(state.api.getPerceptions() as PerceptionType[]));
}

// ─── Direction key helper ────────────────────────────────────────────────────
type MoveDir = 'up' | 'down' | 'left' | 'right';

function toMoveDir(key: string): MoveDir | null {
  if (key === 'w' || key === 'W' || key === '\x1b[A') return 'up';
  if (key === 's' || key === 'S' || key === '\x1b[B') return 'down';
  if (key === 'a' || key === 'A' || key === '\x1b[D') return 'left';
  if (key === 'd' || key === 'D' || key === '\x1b[C') return 'right';
  return null;
}

// ─── Process one keypress ─────────────────────────────────────────────────────
function processKey(key: string, state: GameState): void {
  const { api } = state;

  // ── Awaiting shoot direction ─────────────────────────────────────────────────
  if (state.awaitingShoot) {
    if (key === '\x1b') {
      state.awaitingShoot = false;
      state.lastMessage = `${C.dim}Tiro cancelado.${C.reset}`;
      return;
    }
    const dir = toMoveDir(key);
    if (dir) {
      state.awaitingShoot = false;
      api.shoot(dir);
      record(state);
      const percs = api.getPerceptions() as PerceptionType[];
      if (percs.includes(PerceptionType.SCREAM)) {
        state.lastMessage = `${C.bold}${C.red}GRITO! Voce acertou o Wumpus! Agora fuja com o ouro!${C.reset}`;
      } else {
        state.lastMessage = `${C.yellow}A flecha cortou o escuro... e errou.${C.reset}`;
      }
      state.turn++;
    }
    return;
  }

  const moveDir = toMoveDir(key);

  // ── Movement ─────────────────────────────────────────────────────────────────
  if (moveDir) {
    const moved = api.move(moveDir);
    record(state);
    const ps = api.getPlayerState();

    if (!ps.isAlive) {
      const killer = state.entities.find(e =>
        e.position.x === ps.position.x && e.position.y === ps.position.y
      );
      const cause = killer?.type === EntityType.WUMPUS
        ? `${C.red}devorado pelo Wumpus!${C.reset}`
        : `${C.blue}caiu num buraco sem fundo!${C.reset}`;
      state.lastMessage = `${C.bold}${C.red}VOCE MORREU — ${C.reset}${cause}`;
      state.gameOver = true;
      state.revealed = true;
    } else if (!moved) {
      state.lastMessage = `${C.dim}Voce bate na parede.${C.reset}`;
      // Bump doesn't cost a turn
    } else {
      state.lastMessage = `${C.dim}Voce avanca...${C.reset}`;
      state.turn++;
    }

  // ── Shoot ─────────────────────────────────────────────────────────────────────
  } else if (key === 'f' || key === 'F') {
    if (api.getPlayerState().arrows <= 0) {
      state.lastMessage = `${C.red}Voce nao tem mais flechas!${C.reset}`;
    } else {
      state.awaitingShoot = true;
      state.lastMessage = `${C.yellow}Preparando a flecha...${C.reset}`;
    }

  // ── Grab gold ─────────────────────────────────────────────────────────────────
  } else if (key === 'g' || key === 'G') {
    if (api.grabGold()) {
      record(state);
      state.lastMessage = `${C.bold}${C.yellow}Voce pegou o OURO! Volte para a saida em (0,0)!${C.reset}`;
      state.turn++;
    } else {
      state.lastMessage = `${C.dim}Nao ha ouro aqui.${C.reset}`;
    }

  // ── Exit cavern ───────────────────────────────────────────────────────────────
  } else if (key === 'e' || key === 'E') {
    if (api.exitCavern()) {
      const ps = api.getPlayerState();
      if (ps.isWinner) {
        state.lastMessage =
          `${C.bold}${C.bgGreen} VITORIA! Voce escapou com o ouro! ${C.reset}`;
      } else {
        state.lastMessage =
          `${C.green}Voce saiu da caverna... mas sem o ouro. Vitoria vazia.${C.reset}`;
      }
      state.gameOver = true;
      state.revealed = true;
    } else {
      state.lastMessage = `${C.red}A saida so funciona na posicao (0,0)!${C.reset}`;
    }
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────
function main(): void {
  if (!process.stdin.isTTY) {
    console.error('Este jogo requer um terminal interativo (TTY).');
    process.exit(1);
  }

  let state = initGame();
  render(state);

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  process.stdin.on('keypress', (str: string, key: any) => {
    const raw: string = key?.sequence ?? str ?? '';

    // Always allow quit
    if (raw === 'q' || raw === 'Q' || raw === '\u0003') {
      clear();
      console.log(`\n${C.bold}Ate a proxima!${C.reset}\n`);
      process.stdin.setRawMode(false);
      process.exit(0);
    }

    if (state.gameOver && !state.awaitingShoot) {
      if (raw === 'r' || raw === 'R') {
        state = initGame();
      }
    } else {
      processKey(raw, state);
    }

    render(state);
  });
}

main();
