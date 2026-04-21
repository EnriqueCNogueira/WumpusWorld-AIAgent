import { Player } from '../../domain/entities/Player';
import { Wumpus, Pit, Gold } from '../../domain/entities/EnvironmentEntities';
import { IEntity } from '../../domain/interfaces/IEntity';
import { Position, IPosition } from '../../domain/types/Position';

export interface WorldConfig {
  player: Player;
  entities: IEntity[];
  gridSize: number;
}

export interface RandomWorldOptions {
  gridSize?: number;
  pitProbability?: number;
  seed?: number;
  maxAttempts?: number;
}

const START: IPosition = new Position(0, 0);

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function posKey(p: IPosition): string {
  return `${p.x},${p.y}`;
}

function allCells(gridSize: number): IPosition[] {
  const cells: IPosition[] = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      cells.push(new Position(x, y));
    }
  }
  return cells;
}

function pathExists(
  start: IPosition,
  goal: IPosition,
  gridSize: number,
  blocked: Set<string>
): boolean {
  if (blocked.has(posKey(start))) return false;
  const visited = new Set<string>([posKey(start)]);
  const queue: IPosition[] = [start];
  const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.x === goal.x && cur.y === goal.y) return true;
    for (const [dx, dy] of deltas) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) continue;
      const key = `${nx},${ny}`;
      if (visited.has(key) || blocked.has(key)) continue;
      visited.add(key);
      queue.push(new Position(nx, ny));
    }
  }
  return false;
}

export class WorldFactory {
  public static createFixedWorld(): WorldConfig {
    const gridSize = 4;
    const player = new Player('player-1', new Position(0, 0));
    const entities: IEntity[] = [
      new Wumpus('wumpus-1', new Position(2, 2)),
      new Pit('pit-1', new Position(2, 0)),
      new Pit('pit-2', new Position(3, 2)),
      new Pit('pit-3', new Position(0, 3)),
      new Gold('gold-1', new Position(1, 2))
    ];
    return { player, entities, gridSize };
  }

  public static createRandomWorld(options: RandomWorldOptions = {}): WorldConfig {
    const gridSize = options.gridSize ?? 4;
    const pitProbability = options.pitProbability ?? 0.2;
    const maxAttempts = options.maxAttempts ?? 50;
    const rand = options.seed !== undefined ? mulberry32(options.seed) : Math.random;

    if (gridSize < 4) {
      throw new Error('Grid size must be at least 4x4');
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidates = allCells(gridSize).filter(c => !(c.x === 0 && c.y === 0));

      const wumpusIdx = Math.floor(rand() * candidates.length);
      const wumpusPos = candidates[wumpusIdx];
      const afterWumpus = candidates.filter(c => !c.equals(wumpusPos));

      const goldIdx = Math.floor(rand() * afterWumpus.length);
      const goldPos = afterWumpus[goldIdx];

      const pits: IPosition[] = [];
      for (const cell of candidates) {
        if (cell.equals(wumpusPos) || cell.equals(goldPos)) continue;
        if (rand() < pitProbability) pits.push(cell);
      }

      const blocked = new Set<string>([
        posKey(wumpusPos),
        ...pits.map(posKey)
      ]);

      if (!pathExists(START, goldPos, gridSize, blocked)) continue;

      const player = new Player('player-1', new Position(0, 0));
      const entities: IEntity[] = [
        new Wumpus('wumpus-1', wumpusPos),
        new Gold('gold-1', goldPos),
        ...pits.map((p, i) => new Pit(`pit-${i + 1}`, p))
      ];
      return { player, entities, gridSize };
    }

    throw new Error(`WorldFactory: failed to generate a viable world after ${maxAttempts} attempts`);
  }
}
