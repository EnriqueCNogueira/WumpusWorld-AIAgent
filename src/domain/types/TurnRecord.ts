import { PerceptionType } from './PerceptionType';

export interface TurnRecord {
  turnNumber: number;
  actionTaken: string;
  perceptionsResulting: PerceptionType[];
  isAlive: boolean;
}