import { GameEngine } from '../../application/engine/GameEngine';
import { IObserver } from '../../domain/interfaces/IObserver';
import { PerceptionType } from '../../domain/types/PerceptionType';
import { MovementService } from '../../application/actions/MovementService';
import { ShootingService } from '../../application/actions/ShootingService'; // Adicionar
import { InteractionService } from '../../application/actions/InteractionService';

export class WumpusWorldAPI implements IObserver {
  private engine: GameEngine;
  private movementService: MovementService;
  private shootingService: ShootingService; // Adicionar
  private currentPerceptions: Set<PerceptionType> = new Set();
  private interactionService: InteractionService;

  constructor() {
    this.engine = GameEngine.getInstance();
    this.movementService = new MovementService(this.engine);
    this.shootingService = new ShootingService(this.engine); // Inicializar
    this.engine.perceptionSystem.addObserver(this);
    this.interactionService = new InteractionService(this.engine);
  }

  public onPerceptionUpdate(perceptions: Set<PerceptionType>): void {
    this.currentPerceptions = perceptions;
  }

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

  public moveForward(): void {
    this.movementService.moveForward();
  }

  public shoot(): void {
    this.shootingService.shoot();
  }

  public grabGold(): boolean {
    return this.interactionService.grabGold();
  }

  public climb(): boolean {
    return this.interactionService.climb();
  }
}