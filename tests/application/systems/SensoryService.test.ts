import { GameEngine } from '../../../src/application/engine/GameEngine';
import { WumpusWorldAPI } from '../../../src/infrastructure/api/WumpusWorldAPI';
import { Player } from '../../../src/domain/entities/Player';
import { Position } from '../../../src/domain/types/Position';
import { Pit } from '../../../src/domain/entities/EnvironmentEntities';
import { PerceptionType } from '../../../src/domain/types/PerceptionType';
import { SensoryService } from '../../../src/application/systems/SensoryService';

describe('Sensory Automation', () => {
  let api: WumpusWorldAPI;
  let engine: GameEngine;
  let sensory: SensoryService;

  beforeEach(() => {
    // Reinicialização completa do ambiente de teste
    GameEngine.getInstance().resetStateForTesting();
    engine = GameEngine.getInstance();
    
    const player = new Player('p1', new Position(0, 0));
    const pit = new Pit('pit1', new Position(0, 1)); // Adjacente ao player
    
    engine.initialize(4, player, [pit]);
    
    // API deve ser instanciada APÓS o reset para observar o motor correto
    api = new WumpusWorldAPI();
    sensory = new SensoryService(engine);
  });

  test('Deve emitir BREEZE ao se aproximar de um poço', () => {
    sensory.updatePerceptions();

    const perceptions = api.getPerceptions();
    expect(perceptions).toContain(PerceptionType.BREEZE);
  });
});