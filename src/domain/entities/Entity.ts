import { IEntity } from '../interfaces/IEntity';
import { IPosition } from '../types/Position';
import { EntityType } from '../types/EntityType';

export abstract class Entity implements IEntity {
  constructor(
    public readonly id: string,
    public readonly type: EntityType,
    public position: IPosition
  ) {}
}