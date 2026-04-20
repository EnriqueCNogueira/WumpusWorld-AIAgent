import { WumpusWorldAPI } from '../../../src/infrastructure/api/WumpusWorldAPI';
import { GameEngine } from '../../../src/application/engine/GameEngine';
import { Player } from '../../../src/domain/entities/Player';
import { Position } from '../../../src/domain/types/Position';
import { PerceptionType } from '../../../src/domain/types/PerceptionType';

describe('WumpusWorldAPI (Facade Pattern)', () => {
  let api: WumpusWorldAPI;
  let engine: GameEngine;

  beforeEach(() => {
    // Reseta o Singleton para evitar Stale Reference
    GameEngine.getInstance().resetStateForTesting();
    engine = GameEngine.getInstance();
    
    const player = new Player('player-1', new Position(0, 0));
    engine.initialize(4, player, []);
    
    // Instancia a Facade vinculada ao motor atual
    api = new WumpusWorldAPI();
  });

  test('Deve retornar o estado anonimizado do jogador', () => {
    const state = api.getPlayerState();
    expect(state.isAlive).toBe(true);
    expect(state.hasGold).toBe(false);
    expect(state.arrows).toBe(1);
  });

  test('Deve armazenar e retornar percepcoes capturadas do barramento (Observer)', () => {
    const perceptions = new Set([PerceptionType.BREEZE, PerceptionType.STENCH]);
    engine.perceptionSystem.notifyObservers(perceptions);

    const apiPerceptions = api.getPerceptions();
    expect(apiPerceptions).toContain(PerceptionType.BREEZE);
    expect(apiPerceptions).toContain(PerceptionType.STENCH);
    expect(apiPerceptions.length).toBe(2);
  });

  test('Deve executar ações de movimento e tiro sem lançar erros de implementação', () => {
    // Valida que os métodos agora estão mapeados corretamente no motor
    expect(() => api.moveForward()).not.toThrow();
    expect(() => api.shoot()).not.toThrow();
  });
});