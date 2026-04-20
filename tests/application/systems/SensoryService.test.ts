import { GameEngine } from '../../../src/application/engine/GameEngine';
import { MovementService } from '../../../src/application/actions/MovementService';
import { Player } from '../../../src/domain/entities/Player';
import { Pit } from '../../../src/domain/entities/EnvironmentEntities';
import { Position } from '../../../src/domain/types/Position';
import { PerceptionType } from '../../../src/domain/types/PerceptionType';
import { WumpusWorldAPI } from '../../../src/infrastructure/api/WumpusWorldAPI';

describe('Sensory Automation', () => {
  test('Deve emitir BREEZE ao se aproximar de um poço', () => {
    const engine = GameEngine.getInstance();
    engine.resetStateForTesting();
    
    const player = new Player('p1', new Position(0, 0));
    const pit = new Pit('pit-1', new Position(0, 1));
    engine.initialize(4, player, [pit]);

    const api = new WumpusWorldAPI();
    const movement = new MovementService(engine);

    // Jogador está em (0,0), poço em (0,1). Adjacente!
    // Precisamos de um gatilho de atualização ou movimento
    (movement as any).sensoryService.updatePerceptions();

    expect(api.getPerceptions()).toContain(PerceptionType.BREEZE);
  });
});