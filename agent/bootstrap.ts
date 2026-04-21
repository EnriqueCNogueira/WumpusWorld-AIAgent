import { GameEngine } from '../src/application/engine/GameEngine';
import { WumpusWorldAPI } from '../src/infrastructure/api/WumpusWorldAPI';
import { WorldFactory, WorldConfig } from '../src/infrastructure/factories/WorldFactory';
import { SpatialMemory } from './memory';
import { EntityType } from '../src/domain/types/EntityType';

export interface GameContext {
  api: WumpusWorldAPI;
  memory: SpatialMemory;
  gridSize: number;
  world: WorldConfig;
}

export function createGame(options: { seed?: number; fixed?: boolean } = {}): GameContext {
  const engine = GameEngine.getInstance();
  engine.resetStateForTesting();

  const world = options.fixed
    ? WorldFactory.createFixedWorld()
    : WorldFactory.createRandomWorld({ seed: options.seed, pitProbability: 0.2 });

  engine.initialize(world.gridSize, world.player, world.entities);

  const api = new WumpusWorldAPI();
  const memory = new SpatialMemory(world.gridSize);
  memory.update({ x: 0, y: 0 }, api.getPerceptions());

  return { api, memory, gridSize: world.gridSize, world };
}

export function describeWorld(world: WorldConfig): string {
  const wumpus = world.entities.find(e => e.type === EntityType.WUMPUS);
  const gold = world.entities.find(e => e.type === EntityType.GOLD);
  const pits = world.entities.filter(e => e.type === EntityType.PIT);
  return [
    `Grid ${world.gridSize}x${world.gridSize}`,
    `Wumpus: (${wumpus?.position.x},${wumpus?.position.y})`,
    `Gold: (${gold?.position.x},${gold?.position.y})`,
    `Pits: ${pits.map(p => `(${p.position.x},${p.position.y})`).join(' ') || 'nenhum'}`
  ].join(' | ');
}
