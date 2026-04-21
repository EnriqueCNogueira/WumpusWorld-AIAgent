import { GameEngine } from '../engine/GameEngine';
import { Position } from '../../domain/types/Position';
import { Direction } from '../../domain/types/Direction';
import { PerceptionType } from '../../domain/types/PerceptionType';
import { SensoryService } from '../systems/SensoryService';

export class MovementService {
  private sensoryService: SensoryService;

  constructor(private engine: GameEngine) {
    this.sensoryService = new SensoryService(this.engine);
  }

  // Novo: Método de alto nível para o Agente de IA
  public moveTo(targetDirection: Direction): boolean {
    const player = this.engine.player;
    if (!player.isAlive) return false;

    // 1. Ajustar orientação
    while (player.direction !== targetDirection) {
      this.turnRight();
    }

    // 2. Tentar mover
    return this.moveForward();
  }

  public moveForward(): boolean {
    const player = this.engine.player;
    if (!player.isAlive) return false;

    let { x, y } = player.position;
    switch (player.direction) {
      case Direction.NORTH: y -= 1; break;
      case Direction.SOUTH: y += 1; break;
      case Direction.EAST:  x += 1; break;
      case Direction.WEST:  x -= 1; break;
    }

    const newPosition = new Position(x, y);

    if (this.engine.grid.isWithinBounds(newPosition)) {
      player.position = newPosition;
      this.checkCollisions();
      this.sensoryService.updatePerceptions();
      return true;
    } else {
      this.engine.perceptionSystem.notifyObservers(new Set([PerceptionType.BUMP]));
      return false;
    }

    if (this.engine.grid.isWithinBounds(newPosition)) {
      player.position = newPosition;
      this.checkCollisions();
      this.sensoryService.updatePerceptions();
      return true;
    } else {
      // Recupera passivos, adiciona o ativo e notifica
      const perceptions = this.sensoryService.getCurrentPerceptions();
      perceptions.add(PerceptionType.BUMP);
      this.engine.perceptionSystem.notifyObservers(perceptions);
      return false;
    }
  }

  public turnLeft(): void {
    const directions = [Direction.NORTH, Direction.WEST, Direction.SOUTH, Direction.EAST];
    this.rotate(directions);
  }

  public turnRight(): void {
    const directions = [Direction.NORTH, Direction.EAST, Direction.SOUTH, Direction.WEST];
    this.rotate(directions);
  }

  private rotate(order: Direction[]): void {
    const currentIndex = order.indexOf(this.engine.player.direction);
    this.engine.player.direction = order[(currentIndex + 1) % 4];
  }

  private checkCollisions(): void {
    const player = this.engine.player;
    for (const entity of this.engine.entities) {
      if (entity.position.equals(player.position)) {
        if (entity.type === 'WUMPUS' || entity.type === 'PIT') {
          player.isAlive = false;
        }
      }
    }
  }
}