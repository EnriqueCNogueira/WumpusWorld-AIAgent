import { SpatialMemory } from '../../agent/memory';
import { PerceptionType } from '../../src/domain/types/PerceptionType';

describe('SpatialMemory', () => {
  test('inicializa (0,0) como visitado e seguro', () => {
    const m = new SpatialMemory(4);
    expect(m.visited.has('0,0')).toBe(true);
    expect(m.safe.has('0,0')).toBe(true);
  });

  test('BREEZE em (0,0) marca (1,0) e (0,1) como suspeita de poço', () => {
    const m = new SpatialMemory(4);
    m.update({ x: 0, y: 0 }, [PerceptionType.BREEZE]);
    expect(m.suspectedPit.has('1,0')).toBe(true);
    expect(m.suspectedPit.has('0,1')).toBe(true);
  });

  test('STENCH em (0,0) marca vizinhos como suspeita de wumpus', () => {
    const m = new SpatialMemory(4);
    m.update({ x: 0, y: 0 }, [PerceptionType.STENCH]);
    expect(m.suspectedWumpus.has('1,0')).toBe(true);
    expect(m.suspectedWumpus.has('0,1')).toBe(true);
  });

  test('ausência de BREEZE ao entrar em (1,0) limpa suspeita dos vizinhos dessa célula', () => {
    const m = new SpatialMemory(4);
    m.update({ x: 0, y: 0 }, [PerceptionType.BREEZE]);
    expect(m.suspectedPit.has('1,0')).toBe(true);
    m.update({ x: 1, y: 0 }, []);
    expect(m.suspectedPit.has('2,0')).toBe(false);
    expect(m.suspectedPit.has('1,1')).toBe(false);
  });

  test('SCREAM limpa todas as suspeitas de Wumpus', () => {
    const m = new SpatialMemory(4);
    m.update({ x: 0, y: 0 }, [PerceptionType.STENCH]);
    expect(m.suspectedWumpus.size).toBeGreaterThan(0);
    m.update({ x: 1, y: 0 }, [PerceptionType.SCREAM]);
    expect(m.wumpusDead).toBe(true);
    expect(m.suspectedWumpus.size).toBe(0);
  });

  test('célula visitada não fica como suspeita', () => {
    const m = new SpatialMemory(4);
    m.update({ x: 0, y: 0 }, [PerceptionType.BREEZE]);
    m.update({ x: 1, y: 0 }, []);
    expect(m.suspectedPit.has('1,0')).toBe(false);
    expect(m.safe.has('1,0')).toBe(true);
  });

  test('GLITTER marca a posição do ouro', () => {
    const m = new SpatialMemory(4);
    m.update({ x: 1, y: 1 }, [PerceptionType.GLITTER]);
    expect(m.glitterAt).toBe('1,1');
  });

  test('isStuck detecta janela de movimento restrita', () => {
    const m = new SpatialMemory(4);
    for (let i = 0; i < 6; i++) {
      m.update(i % 2 === 0 ? { x: 0, y: 0 } : { x: 1, y: 0 }, []);
    }
    expect(m.isStuck()).toBe(true);
  });
});
