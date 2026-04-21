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
  private historyService: HistoryService;
  private currentPerceptions: Set<PerceptionType> = new Set();

  constructor() {
    this.engine = GameEngine.getInstance();
    this.movementService = new MovementService(this.engine);
    this.shootingService = new ShootingService(this.engine);
    this.interactionService = new InteractionService(this.engine);
    
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

  public shoot(command?: 'up' | 'down' | 'left' | 'right'): boolean {
    const label = command ? `SHOOT_${command.toUpperCase()}` : 'SHOOT';
    this.historyService.registerIntent(label);
    if (command === undefined) {
      return this.shootingService.shoot();
    }
    const mapping: Record<string, Direction> = {
      'up': Direction.NORTH,
      'down': Direction.SOUTH,
      'left': Direction.WEST,
      'right': Direction.EAST
    };
    return this.shootingService.shoot(mapping[command]);
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

  public getRecentHistory(limit: number = 5): TurnRecord[] {
    return this.historyService.getRecentHistory(limit);
  }

  public getPlayerState() {
    const p = this.engine.player;
    return {
      isAlive: p.isAlive,
      isWinner: p.isWinner,
      hasGold: p.hasGold,
      position: { x: p.position.x, y: p.position.y },
      arrows: p.arrows,
      direction: p.direction
    };
  }
}