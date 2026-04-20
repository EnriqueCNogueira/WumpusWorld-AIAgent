import { GameEngine } from '../../../src/application/engine/GameEngine';
import { ShootingService } from '../../../src/application/actions/ShootingService';
import { Player } from '../../../src/domain/entities/Player';
import { Wumpus } from '../../../src/domain/entities/EnvironmentEntities';
import { Position } from '../../../src/domain/types/Position';
import { Direction } from '../../../src/domain/types/Direction';
import { PerceptionType } from '../../../src/domain/types/PerceptionType';

describe('ShootingService', () => {
  let engine: GameEngine;
  let service: ShootingService;

  beforeEach(() => {
    engine = GameEngine.getInstance();
    engine.resetStateForTesting();
  });

  test('Deve matar o Wumpus e emitir grito se estiver na frente do tiro', () => {
    const player = new Player('p1', new Position(0, 0));
    player.direction = Direction.SOUTH;
    const wumpus = new Wumpus('w1', new Position(0, 2));
    
    engine.initialize(4, player, [wumpus]);
    service = new ShootingService(engine);

    const spy = jest.spyOn(engine.perceptionSystem, 'notifyObservers');
    
    service.shoot();

    expect(wumpus.isAlive).toBe(false);
    expect(player.arrows).toBe(0);
    expect(spy).toHaveBeenCalledWith(new Set([PerceptionType.SCREAM]));
  });
});