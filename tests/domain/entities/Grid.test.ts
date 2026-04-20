import { Grid } from '../../../src/domain/entities/Grid';
import { Position } from '../../../src/domain/types/Position';

describe('Grid Entity', () => {
  let grid: Grid;

  beforeEach(() => {
    grid = new Grid(4);
  });

  test('Deve criar uma grade com tamanho valido', () => {
    expect(grid.size).toBe(4);
  });

  test('Deve lançar erro ao tentar criar grade menor que 4x4', () => {
    expect(() => new Grid(3)).toThrow('Grid size must be at least 4x4');
  });

  test('Deve retornar true para posicoes dentro dos limites', () => {
    expect(grid.isWithinBounds(new Position(0, 0))).toBe(true);
    expect(grid.isWithinBounds(new Position(3, 3))).toBe(true);
    expect(grid.isWithinBounds(new Position(1, 2))).toBe(true);
  });

  test('Deve retornar false para posicoes fora dos limites', () => {
    expect(grid.isWithinBounds(new Position(-1, 0))).toBe(false);
    expect(grid.isWithinBounds(new Position(0, 4))).toBe(false);
    expect(grid.isWithinBounds(new Position(4, 4))).toBe(false);
  });
});