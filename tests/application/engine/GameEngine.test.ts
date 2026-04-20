import { GameEngine } from '../../../src/application/engine/GameEngine';
import { Player } from '../../../src/domain/entities/Player';
import { Wumpus } from '../../../src/domain/entities/EnvironmentEntities';
import { Position } from '../../../src/domain/types/Position';

describe('GameEngine (Singleton)', () => {
  beforeEach(() => {
    GameEngine.getInstance().resetStateForTesting();
  });

  test('Deve garantir a instancia unica estrita (Singleton)', () => {
    const instance1 = GameEngine.getInstance();
    const instance2 = GameEngine.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  test('Deve inicializar o estado do jogo corretamente', () => {
    const engine = GameEngine.getInstance();
    const player = new Player('player-1', new Position(0, 0));
    const wumpus = new Wumpus('wumpus-1', new Position(2, 2));

    engine.initialize(4, player, [wumpus]);

    expect(engine.grid.size).toBe(4);
    expect(engine.player.id).toBe('player-1');
    expect(engine.entities.length).toBe(1);
    expect(engine.perceptionSystem).toBeDefined();
  });
});