import { WumpusWorldAPI } from '../../../src/infrastructure/api/WumpusWorldAPI';
import { GameEngine } from '../../../src/application/engine/GameEngine';
import { Player } from '../../../src/domain/entities/Player';
import { Position } from '../../../src/domain/types/Position';
import { PerceptionType } from '../../../src/domain/types/PerceptionType';

describe('WumpusWorldAPI (Facade Pattern)', () => {
  let api: WumpusWorldAPI;
  let engine: GameEngine;

  beforeEach(() => {
    // 1. Reseta o Singleton global PRIMEIRO, antes de capturar qualquer referência
    GameEngine.getInstance().resetStateForTesting();
    
    // 2. AGORA capturamos a referência fresca e correta para o teste
    engine = GameEngine.getInstance();
    
    // 3. Inicializa o estado na referência correta
    const player = new Player('player-1', new Position(0, 0));
    engine.initialize(4, player, []);
    
    // 4. Instancia a API (que buscará a mesma referência global inicializada acima)
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

  test('Deve lançar erro ao acionar comandos de acao nao implementados', () => {
    expect(() => api.moveForward()).toThrow('Action mapping not implemented yet.');
    expect(() => api.shoot()).toThrow('Action mapping not implemented yet.');
  });
});