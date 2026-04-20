import { PerceptionType } from '../types/PerceptionType';

export interface IObserver {
  onPerceptionUpdate(perceptions: Set<PerceptionType>): void;
}

export interface ISubject {
  addObserver(observer: IObserver): void;
  removeObserver(observer: IObserver): void;
  notifyObservers(perceptions: Set<PerceptionType>): void;
}