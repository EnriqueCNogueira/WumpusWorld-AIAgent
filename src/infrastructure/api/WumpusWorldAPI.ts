import { GameEngine } from '../../application/engine/GameEngine';
import { IObserver } from '../../domain/interfaces/IObserver';
import { PerceptionType } from '../../domain/types/PerceptionType';
import { MovementService } from '../../application/actions/MovementService';
import { ShootingService } from '../../application/actions/ShootingService';
import { InteractionService } from '../../application/actions/InteractionService';
import { Direction } from '../../domain/types/Direction';
import { HistoryService } from '../../application/systems/HistoryService';
import { TurnRecord } from '../../domain/types/TurnRecord';

export class WumpusWorldAPI implements IObserver {
  private engine: GameEngine;
  private movementService: MovementService;
  private shootingService: ShootingService;
  private interactionService: InteractionService;
  private historyService: HistoryService; // Novo serviço
  private currentPerceptions: Set<PerceptionType> = new Set();

  constructor() {
    this.engine = GameEngine.getInstance();
    this.movementService = new MovementService(this.engine);
    this.shootingService = new ShootingService(this.engine);
    this.interactionService = new InteractionService(this.engine);
    
    // Inicializa o serviço de histórico
    this.historyService = new HistoryService(this.engine);
    
    this.engine.perceptionSystem.addObserver(this);
  }

  public onPerceptionUpdate(perceptions: Set<PerceptionType>): void {
    this.currentPerceptions = perceptions;
  }

  public move(command: 'up' | 'down' | 'left' | 'right'): boolean {
    this.historyService.registerIntent(`MOVE_${command.toUpperCase()}`);
    const mapping: Record<string, Direction> = {
      'up': Direction.NORTH,
      'down': Direction.SOUTH,
      'left': Direction.WEST,
      'right': Direction.EAST
    };
    return this.movementService.moveTo(mapping[command]);
  }

  public shoot(): boolean {
    this.historyService.registerIntent('SHOOT');
    return this.shootingService.shoot();
  }

  public grabGold(): boolean {
    this.historyService.registerIntent('GRAB_GOLD');
    return this.interactionService.grabGold();
  }

  public exitCavern(): boolean {
    this.historyService.registerIntent('EXIT_CAVERN');
    return this.interactionService.climb();
  }

  public getPerceptions(): PerceptionType[] {
    return Array.from(this.currentPerceptions);
  }

  // Novo método para expor a memória ao Agente
  public getRecentHistory(limit: number = 5): TurnRecord[] {
    return this.historyService.getRecentHistory(limit);
  }

  public getPlayerState() {
    return {
      isAlive: this.engine.player.isAlive,
      hasGold: this.engine.player.hasGold,
      position: `${this.engine.player.position.x},${this.engine.player.position.y}`,
      arrows: this.engine.player.arrows
    };
  }
}