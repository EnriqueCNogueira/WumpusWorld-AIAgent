export interface IPosition {
  x: number;
  y: number;
  equals(other: IPosition): boolean;
}

export class Position implements IPosition {
  constructor(public readonly x: number, public readonly y: number) {}

  public equals(other: IPosition): boolean {
    return this.x === other.x && this.y === other.y;
  }
}