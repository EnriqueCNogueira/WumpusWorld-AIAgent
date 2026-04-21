import { PerceptionType } from '../src/domain/types/PerceptionType';

export interface Cell {
  x: number;
  y: number;
}

const STUCK_WINDOW = 6;

function key(c: Cell): string {
  return `${c.x},${c.y}`;
}

function neighbors(c: Cell, gridSize: number): Cell[] {
  const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const result: Cell[] = [];
  for (const [dx, dy] of deltas) {
    const nx = c.x + dx;
    const ny = c.y + dy;
    if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) continue;
    result.push({ x: nx, y: ny });
  }
  return result;
}

export class SpatialMemory {
  public visited = new Set<string>();
  public safe = new Set<string>();
  public suspectedPit = new Set<string>();
  public suspectedWumpus = new Set<string>();
  public confirmedDanger = new Set<string>();
  public wumpusDead = false;
  public glitterAt: string | null = null;
  private lastPositions: string[] = [];

  constructor(private readonly gridSize: number) {
    this.visited.add('0,0');
    this.safe.add('0,0');
  }

  public update(pos: Cell, perceptions: PerceptionType[]): void {
    const k = key(pos);
    this.visited.add(k);
    this.safe.add(k);
    this.suspectedPit.delete(k);
    this.suspectedWumpus.delete(k);
    this.confirmedDanger.delete(k);

    this.lastPositions.push(k);
    if (this.lastPositions.length > STUCK_WINDOW) this.lastPositions.shift();

    if (perceptions.includes(PerceptionType.SCREAM)) {
      this.wumpusDead = true;
      this.suspectedWumpus.clear();
    }

    if (perceptions.includes(PerceptionType.GLITTER)) {
      this.glitterAt = k;
    }

    const hasBreeze = perceptions.includes(PerceptionType.BREEZE);
    const hasStench = perceptions.includes(PerceptionType.STENCH);

    for (const n of neighbors(pos, this.gridSize)) {
      const nk = key(n);
      if (this.safe.has(nk)) continue;
      if (hasBreeze) this.suspectedPit.add(nk);
      if (hasStench && !this.wumpusDead) this.suspectedWumpus.add(nk);
    }

    if (!hasBreeze) {
      for (const n of neighbors(pos, this.gridSize)) {
        this.suspectedPit.delete(key(n));
      }
    }
    if (!hasStench) {
      for (const n of neighbors(pos, this.gridSize)) {
        this.suspectedWumpus.delete(key(n));
      }
    }

    for (const cell of this.suspectedPit) {
      if (this.suspectedWumpus.has(cell)) this.confirmedDanger.add(cell);
    }
  }

  public isStuck(): boolean {
    if (this.lastPositions.length < STUCK_WINDOW) return false;
    const unique = new Set(this.lastPositions);
    return unique.size <= 2;
  }

  public frontier(pos: Cell): string[] {
    return neighbors(pos, this.gridSize)
      .map(key)
      .filter(k => !this.visited.has(k));
  }

  public render(pos: Cell): string {
    const k = key(pos);
    const frontier = this.frontier(pos);
    const safeFrontier = frontier.filter(
      f => !this.suspectedPit.has(f) && !this.suspectedWumpus.has(f) && !this.confirmedDanger.has(f)
    );
    const dangerFrontier = frontier.filter(
      f => this.suspectedPit.has(f) || this.suspectedWumpus.has(f) || this.confirmedDanger.has(f)
    );

    return [
      `Posição Atual: (${pos.x},${pos.y})${k === '0,0' ? ' [SAÍDA]' : ''}`,
      `Células Visitadas: ${[...this.visited].join(' ') || 'nenhuma'}`,
      `Seguras: ${[...this.safe].join(' ') || 'nenhuma'}`,
      `Suspeita de Poço: ${[...this.suspectedPit].join(' ') || 'nenhuma'}`,
      `Suspeita de Wumpus: ${[...this.suspectedWumpus].join(' ') || 'nenhuma'}`,
      `Perigo Confirmado: ${[...this.confirmedDanger].join(' ') || 'nenhum'}`,
      `Wumpus Morto: ${this.wumpusDead ? 'sim' : 'não'}`,
      `Ouro Localizado: ${this.glitterAt ?? 'desconhecido'}`,
      `Fronteira Segura (inexplorada): ${safeFrontier.join(' ') || 'nenhuma'}`,
      `Fronteira Perigosa: ${dangerFrontier.join(' ') || 'nenhuma'}`
    ].join('\n');
  }
}
