import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { WumpusWorldAPI } from '../src/infrastructure/api/WumpusWorldAPI';
import { SpatialMemory } from './memory';

type DirCmd = 'up' | 'down' | 'left' | 'right';

// Aceita tanto UP/DOWN/LEFT/RIGHT quanto NORTH/SOUTH/EAST/WEST para tolerar o modelo.
const DirectionSchema = z.enum(['UP', 'DOWN', 'LEFT', 'RIGHT', 'NORTH', 'SOUTH', 'EAST', 'WEST']);

const CARDINAL_MAP: Record<string, DirCmd> = {
  UP: 'up', DOWN: 'down', LEFT: 'left', RIGHT: 'right',
  NORTH: 'up', SOUTH: 'down', WEST: 'left', EAST: 'right'
};

function normalize(d: z.infer<typeof DirectionSchema>): DirCmd {
  return CARDINAL_MAP[d] ?? (d.toLowerCase() as DirCmd);
}

function snapshot(api: WumpusWorldAPI) {
  const s = api.getPlayerState();
  return {
    position: s.position,
    perceptions: api.getPerceptions(),
    alive: s.isAlive,
    isWinner: s.isWinner,
    hasGold: s.hasGold,
    arrows: s.arrows
  };
}

export function buildTools(api: WumpusWorldAPI, memory: SpatialMemory) {
  const refreshMemory = () => {
    const pos = api.getPlayerState().position;
    memory.update(pos, api.getPerceptions());
  };

  const andar = new DynamicStructuredTool({
    name: 'andar',
    description:
      'Move o jogador uma célula na direção indicada (UP, DOWN, LEFT, RIGHT). ' +
      'Retorna JSON com posição, percepções e status. ' +
      'Se houver parede, retorna erro e as percepções atuais.',
    schema: z.object({ direcao: DirectionSchema }),
    func: async ({ direcao }) => {
      const success = api.move(normalize(direcao));
      refreshMemory();
      const snap = snapshot(api);
      if (!success) {
        return JSON.stringify({ erro: 'Parede ou caminho bloqueado', ...snap });
      }
      return JSON.stringify(snap);
    }
  });

  const atirar = new DynamicStructuredTool({
    name: 'atirar',
    description:
      'Dispara a ÚNICA flecha na direção indicada (UP, DOWN, LEFT, RIGHT) sem mover o jogador. ' +
      'Se a flecha atingir o Wumpus, a percepção SCREAM é gerada e o Wumpus morre (STENCH deixa de ser fatal). ' +
      'Use apenas quando tiver alta confiança na posição do Wumpus — você só tem uma flecha.',
    schema: z.object({ direcao: DirectionSchema }),
    func: async ({ direcao }) => {
      const before = api.getPlayerState().arrows;
      const success = api.shoot(normalize(direcao));
      refreshMemory();
      const snap = snapshot(api);
      return JSON.stringify({
        success,
        arrowsBefore: before,
        wumpusDead: memory.wumpusDead,
        ...snap
      });
    }
  });

  const pegarOuro = new DynamicStructuredTool({
    name: 'pegar_ouro',
    description: 'Tenta pegar o ouro na célula atual. Só funciona se GLITTER está presente nas percepções.',
    schema: z.object({}),
    func: async () => {
      const success = api.grabGold();
      refreshMemory();
      return JSON.stringify({ success, ...snapshot(api) });
    }
  });

  const escalarSaida = new DynamicStructuredTool({
    name: 'escalar_saida',
    description:
      'Escala e sai da caverna. Só é válido na célula (0,0). ' +
      'Se executado com o ouro, termina em vitória. Sem o ouro, termina a partida sem pontuação.',
    schema: z.object({}),
    func: async () => {
      const success = api.exitCavern();
      refreshMemory();
      return JSON.stringify({ success, ...snapshot(api) });
    }
  });

  return [andar, atirar, pegarOuro, escalarSaida];
}
