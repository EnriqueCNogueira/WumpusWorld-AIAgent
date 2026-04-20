import { IPosition } from '../types/Position';
import { EntityType } from '../types/EntityType';

export interface IEntity {
  readonly id: string;
  readonly type: EntityType;
  position: IPosition;
}