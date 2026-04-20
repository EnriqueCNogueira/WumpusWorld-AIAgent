import { GameEngine } from '../../application/engine/GameEngine';
import { IObserver } from '../../domain/interfaces/IObserver';
import { PerceptionType } from '../../domain/types/PerceptionType';

export class WumpusWorldAPI implements IObserver {
  private engine: GameEngine;
  private currentPerceptions: Set<PerceptionType> = new Set();

  constructor() {
    this.engine = GameEngine.getInstance();
    // A API se inscreve no sistema para repassar os dados ao cliente "cego"
    this.engine.perceptionSystem.addObserver(this);
  }

  // Contrato do IObserver
  public onPerceptionUpdate(perceptions: Set<PerceptionType>): void {
    this.currentPerceptions = perceptions;
  }

  // --- Contratos Públicos da Facade ---

  public getPerceptions(): PerceptionType[] {
    return Array.from(this.currentPerceptions);
  }

  public getPlayerState(): { isAlive: boolean; hasGold: boolean; arrows: number } {
    return {
      isAlive: this.engine.player.isAlive,
      hasGold: this.engine.player.hasGold,
      arrows: this.engine.player.arrows
    };
  }

  // Assinaturas de comandos (A lógica de movimentação será injetada no motor na próxima etapa)
  public moveForward(): void {
    throw new Error('Action mapping not implemented yet.');
  }

  public shoot(): void {
    throw new Error('Action mapping not implemented yet.');
  }
}