import { IObserver, ISubject } from '../../domain/interfaces/IObserver';
import { PerceptionType } from '../../domain/types/PerceptionType';

export class PerceptionSystem implements ISubject {
  private observers: Set<IObserver> = new Set();

  public addObserver(observer: IObserver): void {
    this.observers.add(observer);
  }

  public removeObserver(observer: IObserver): void {
    this.observers.delete(observer);
  }

  public notifyObservers(perceptions: Set<PerceptionType>): void {
    for (const observer of this.observers) {
      observer.onPerceptionUpdate(perceptions);
    }
  }
}