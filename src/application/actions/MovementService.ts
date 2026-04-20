import { GameEngine } from '../engine/GameEngine';
import { Position } from '../../domain/types/Position';
import { Direction } from '../../domain/types/Direction';
import { PerceptionType } from '../../domain/types/PerceptionType'; // ADICIONE ESTA LINHA
import { SensoryService } from '../systems/SensoryService';

export class MovementService {
  private sensoryService: SensoryService;

  constructor(private engine: GameEngine) {
    this.sensoryService = new SensoryService(this.engine);
  }

  public moveForward(): void {
    const player = this.engine.player;
    if (!player.isAlive) return;

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
    } else {
      // O erro 'Cannot find name' desaparece após a importação acima
      this.engine.perceptionSystem.notifyObservers(new Set([PerceptionType.BUMP]));
    }
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