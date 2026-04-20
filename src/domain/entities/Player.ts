import { Entity } from './Entity';
import { IPosition } from '../types/Position';
import { EntityType } from '../types/EntityType';
import { Direction } from '../types/Direction';

export class Player extends Entity {
  public isAlive: boolean = true;
  public hasGold: boolean = false;
  public arrows: number = 1;
  public direction: Direction = Direction.EAST; // Inicia virado para o Leste

  constructor(id: string, position: IPosition) {
    super(id, EntityType.PLAYER, position);
  }
}