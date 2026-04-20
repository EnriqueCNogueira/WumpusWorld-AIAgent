import { GameEngine } from '../../../src/application/engine/GameEngine';
import { InteractionService } from '../../../src/application/actions/InteractionService';
import { Player } from '../../../src/domain/entities/Player';
import { Gold } from '../../../src/domain/entities/EnvironmentEntities';
import { Position } from '../../../src/domain/types/Position';

describe('InteractionService', () => {
  let engine: GameEngine;
  let service: InteractionService;

  beforeEach(() => {
    engine = GameEngine.getInstance();
    engine.resetStateForTesting();
  });

  test('Deve permitir pegar o ouro quando na mesma posicao', () => {
    const player = new Player('p1', new Position(1, 1));
    const gold = new Gold('g1', new Position(1, 1));
    engine.initialize(4, player, [gold]);
    service = new InteractionService(engine);

    const success = service.grabGold();
    expect(success).toBe(true);
    expect(player.hasGold).toBe(true);
    expect(engine.entities.length).toBe(0);
  });
});