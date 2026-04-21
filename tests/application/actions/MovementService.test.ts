import { GameEngine } from '../../../src/application/engine/GameEngine';
import { MovementService } from '../../../src/application/actions/MovementService';
import { Player } from '../../../src/domain/entities/Player';
import { Position } from '../../../src/domain/types/Position';
import { Direction } from '../../../src/domain/types/Direction';
import { Pit } from '../../../src/domain/entities/EnvironmentEntities';
import { PerceptionType } from '../../../src/domain/types/PerceptionType';

describe('MovementService', () => {
  let engine: GameEngine;
  let movementService: MovementService;
  let player: Player;

  beforeEach(() => {
    engine = GameEngine.getInstance();
    engine.resetStateForTesting();
    
    player = new Player('player-1', new Position(0, 0));
    player.direction = Direction.EAST; // Virado para a direita
    
    engine.initialize(4, player, [new Pit('pit-1', new Position(1, 0))]);
    movementService = new MovementService(engine);
  });

  test('Deve mover o jogador para a proxima coordenada valida', () => {
    movementService.moveForward();
    expect(player.position.equals(new Position(1, 0))).toBe(true);
  });

  test('Nao deve mover o jogador para fora do mapa', () => {
    player.direction = Direction.WEST; // Vira para a parede esquerda
    movementService.moveForward();
    expect(player.position.equals(new Position(0, 0))).toBe(true);
  });

  test('Deve matar o jogador ao colidir com um Poço (Pit)', () => {
    expect(player.isAlive).toBe(true);
    movementService.moveForward(); // Move para (1,0) onde está o poço
    expect(player.isAlive).toBe(false);
  });

  test('BUMP deve preservar percepções passivas (BREEZE) ao colidir com parede', () => {
    player.direction = Direction.WEST;
    const spy = jest.spyOn(engine.perceptionSystem, 'notifyObservers');
    movementService.moveForward();
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastCall.has(PerceptionType.BUMP)).toBe(true);
    expect(lastCall.has(PerceptionType.BREEZE)).toBe(true);
  });

  test('moveTo deve reorientar e mover em uma chamada', () => {
    movementService.moveTo(Direction.SOUTH);
    expect(player.direction).toBe(Direction.SOUTH);
    expect(player.position.equals(new Position(0, 1))).toBe(true);
  });
});