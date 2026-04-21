import { GameEngine } from '../engine/GameEngine';
import { IObserver } from '../../domain/interfaces/IObserver';
import { PerceptionType } from '../../domain/types/PerceptionType';
import { TurnRecord } from '../../domain/types/TurnRecord';

export class HistoryService implements IObserver {
  private history: TurnRecord[] = [];
  private currentTurnNumber: number = 0;
  private pendingAction: string = 'INIT';

  constructor(private engine: GameEngine) {
    this.engine.perceptionSystem.addObserver(this);
  }

  public registerIntent(action: string): void {
    this.pendingAction = action;
  }

  public onPerceptionUpdate(perceptions: Set<PerceptionType>): void {
    this.currentTurnNumber++;
    
    const record: TurnRecord = {
      turnNumber: this.currentTurnNumber,
      actionTaken: this.pendingAction,
      perceptionsResulting: Array.from(perceptions),
      isAlive: this.engine.player.isAlive
    };

    this.history.push(record);
  }

  public getRecentHistory(limit: number): TurnRecord[] {
    return this.history.slice(-limit);
  }
}