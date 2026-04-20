import { Entity } from './Entity';
import { IPosition } from '../types/Position';
import { EntityType } from '../types/EntityType';

export class Player extends Entity {
  public isAlive: boolean = true;
  public hasGold: boolean = false;
  public arrows: number = 1;

  constructor(id: string, position: IPosition) {
    super(id, EntityType.PLAYER, position);
  }
}