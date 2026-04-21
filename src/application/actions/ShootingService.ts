import { GameEngine } from '../engine/GameEngine';
import { PerceptionType } from '../../domain/types/PerceptionType';
import { EntityType } from '../../domain/types/EntityType';
import { Wumpus } from '../../domain/entities/EnvironmentEntities';
import { SensoryService } from '../systems/SensoryService';

export class ShootingService {
  constructor(private engine: GameEngine) {}

  public shoot(): boolean {
    const player = this.engine.player;

    if (!player.isAlive || player.arrows <= 0) {
      return false;
    }

    player.arrows -= 1;
    const hit = this.checkWumpusHit();

    // Recupera percepções do ambiente para não sobrepor
    const sensoryService = new SensoryService(this.engine);
    const perceptions = sensoryService.getCurrentPerceptions();

    if (hit) {
      perceptions.add(PerceptionType.SCREAM);
    }
    
    this.engine.perceptionSystem.notifyObservers(perceptions);
    return true;
  }

  private checkWumpusHit(): boolean {
    const player = this.engine.player;
    const { x: px, y: py } = player.position;
    
    const wumpus = this.engine.entities.find(
      (e): e is Wumpus => e.type === EntityType.WUMPUS && (e as Wumpus).isAlive
    );

    if (!wumpus) return false;

    const { x: wx, y: wy } = wumpus.position;

    // Verifica se o Wumpus está na linha de tiro baseada na direção do jogador
    const inLine = (player.direction === 'NORTH' && wx === px && wy < py) ||
                   (player.direction === 'SOUTH' && wx === px && wy > py) ||
                   (player.direction === 'EAST'  && wy === py && wx > px) ||
                   (player.direction === 'WEST'  && wy === py && wx < px);

    if (inLine) {
      wumpus.isAlive = false;
      return true;
    }

    return false;
  }
}