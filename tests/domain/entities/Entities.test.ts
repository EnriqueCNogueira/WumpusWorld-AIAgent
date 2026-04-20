import { Position } from '../../../src/domain/types/Position';
import { Player } from '../../../src/domain/entities/Player';
import { Wumpus, Pit, Gold } from '../../../src/domain/entities/EnvironmentEntities';
import { EntityType } from '../../../src/domain/types/EntityType';

describe('Domain Entities', () => {
  const initialPosition = new Position(0, 0);

  test('Deve instanciar um Player com estado inicial correto', () => {
    const player = new Player('player-1', initialPosition);
    expect(player.type).toBe(EntityType.PLAYER);
    expect(player.isAlive).toBe(true);
    expect(player.hasGold).toBe(false);
    expect(player.arrows).toBe(1);
    expect(player.position.equals(new Position(0, 0))).toBe(true);
  });

  test('Deve instanciar entidades de ambiente corretamente', () => {
    const wumpus = new Wumpus('wumpus-1', new Position(1, 1));
    const pit = new Pit('pit-1', new Position(2, 2));
    const gold = new Gold('gold-1', new Position(3, 3));

    expect(wumpus.type).toBe(EntityType.WUMPUS);
    expect(wumpus.isAlive).toBe(true);
    expect(pit.type).toBe(EntityType.PIT);
    expect(gold.type).toBe(EntityType.GOLD);
  });
});