import { GameEngine } from '../engine/GameEngine';
import { EntityType } from '../../domain/types/EntityType';

export class InteractionService {
  constructor(private engine: GameEngine) {}

  public grabGold(): boolean {
    const player = this.engine.player;
    if (!player.isAlive) return false;

    // Busca ouro na mesma posição do jogador
    const goldIndex = this.engine.entities.findIndex(
      e => e.type === EntityType.GOLD && e.position.equals(player.position)
    );

    if (goldIndex !== -1) {
      player.hasGold = true;
      // Remove o ouro da grade (mutação controlada via motor)
      (this.engine as any)._entities.splice(goldIndex, 1); 
      return true;
    }
    return false;
  }

  public climb(): boolean {
    const player = this.engine.player;
    // Regra: Só pode escalar na posição inicial [0,0]
    if (player.position.x === 0 && player.position.y === 0) {
      console.log("Jogador escapou da caverna!");
      return true;
    }
    return false;
  }
}