import { Entity } from './Entity';
import { IPosition } from '../types/Position';
import { EntityType } from '../types/EntityType';

export class Wumpus extends Entity {
  public isAlive: boolean = true;
  constructor(id: string, position: IPosition) {
    super(id, EntityType.WUMPUS, position);
  }
}

export class Pit extends Entity {
  constructor(id: string, position: IPosition) {
    super(id, EntityType.PIT, position);
  }
}

export class Gold extends Entity {
  constructor(id: string, position: IPosition) {
    super(id, EntityType.GOLD, position);
  }
}