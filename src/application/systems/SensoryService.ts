import { GameEngine } from '../engine/GameEngine';
import { PerceptionType } from '../../domain/types/PerceptionType';
import { EntityType } from '../../domain/types/EntityType';
import { IPosition } from '../../domain/types/Position';

export class SensoryService {
  constructor(private engine: GameEngine) {}

  public updatePerceptions(): void {
    const playerPos = this.engine.player.position;
    const perceptions = new Set<PerceptionType>();

    for (const entity of this.engine.entities) {
      // Brilho: Mesma casa que o ouro
      if (entity.type === EntityType.GOLD && entity.position.equals(playerPos)) {
        perceptions.add(PerceptionType.GLITTER);
      }

      // Brisa e Fedor: Casas adjacentes (N, S, L, O)
      if (this.isAdjacent(playerPos, entity.position)) {
        if (entity.type === EntityType.PIT) perceptions.add(PerceptionType.BREEZE);
        if (entity.type === EntityType.WUMPUS) perceptions.add(PerceptionType.STENCH);
      }
    }

    // Notifica todos os observadores (incluindo a Facade)
    this.engine.perceptionSystem.notifyObservers(perceptions);
  }

  private isAdjacent(p1: IPosition, p2: IPosition): boolean {
    const dx = Math.abs(p1.x - p2.x);
    const dy = Math.abs(p1.y - p2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }
}