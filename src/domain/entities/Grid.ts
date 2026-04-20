import { IPosition } from '../types/Position';

export class Grid {
  constructor(public readonly size: number) {
    if (size < 4) {
      throw new Error('Grid size must be at least 4x4');
    }
  }

  public isWithinBounds(position: IPosition): boolean {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    );
  }
}