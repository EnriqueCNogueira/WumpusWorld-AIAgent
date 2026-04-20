import { PerceptionSystem } from '../../../src/application/systems/PerceptionSystem';
import { IObserver } from '../../../src/domain/interfaces/IObserver';
import { PerceptionType } from '../../../src/domain/types/PerceptionType';

describe('PerceptionSystem (Observer Pattern)', () => {
  let system: PerceptionSystem;
  let mockObserver1: jest.Mocked<IObserver>;
  let mockObserver2: jest.Mocked<IObserver>;

  beforeEach(() => {
    system = new PerceptionSystem();
    mockObserver1 = { onPerceptionUpdate: jest.fn() };
    mockObserver2 = { onPerceptionUpdate: jest.fn() };
  });

  test('Deve registrar observadores e notifica-los corretamente', () => {
    system.addObserver(mockObserver1);
    system.addObserver(mockObserver2);

    const perceptions = new Set([PerceptionType.STENCH, PerceptionType.BREEZE]);
    system.notifyObservers(perceptions);

    expect(mockObserver1.onPerceptionUpdate).toHaveBeenCalledWith(perceptions);
    expect(mockObserver2.onPerceptionUpdate).toHaveBeenCalledWith(perceptions);
  });

  test('Nao deve notificar observadores removidos', () => {
    system.addObserver(mockObserver1);
    system.addObserver(mockObserver2);
    system.removeObserver(mockObserver1);

    const perceptions = new Set([PerceptionType.GLITTER]);
    system.notifyObservers(perceptions);

    expect(mockObserver1.onPerceptionUpdate).not.toHaveBeenCalled();
    expect(mockObserver2.onPerceptionUpdate).toHaveBeenCalledWith(perceptions);
  });
});