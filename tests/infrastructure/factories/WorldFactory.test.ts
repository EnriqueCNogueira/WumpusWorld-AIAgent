import { WorldFactory } from '../../../src/infrastructure/factories/WorldFactory';
import { EntityType } from '../../../src/domain/types/EntityType';

describe('WorldFactory', () => {
  describe('createFixedWorld', () => {
    test('gera um mundo determinístico 4x4 com jogador em (0,0)', () => {
      const w = WorldFactory.createFixedWorld();
      expect(w.gridSize).toBe(4);
      expect(w.player.position.x).toBe(0);
      expect(w.player.position.y).toBe(0);
      const wumpus = w.entities.find(e => e.type === EntityType.WUMPUS);
      const gold = w.entities.find(e => e.type === EntityType.GOLD);
      expect(wumpus).toBeDefined();
      expect(gold).toBeDefined();
    });
  });

  describe('createRandomWorld', () => {
    test('jogador sempre em (0,0)', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const w = WorldFactory.createRandomWorld({ seed });
        expect(w.player.position.x).toBe(0);
        expect(w.player.position.y).toBe(0);
      }
    });

    test('mesmo seed produz o mesmo mundo', () => {
      const a = WorldFactory.createRandomWorld({ seed: 42 });
      const b = WorldFactory.createRandomWorld({ seed: 42 });
      expect(a.entities.length).toBe(b.entities.length);
      for (let i = 0; i < a.entities.length; i++) {
        expect(a.entities[i].type).toBe(b.entities[i].type);
        expect(a.entities[i].position.x).toBe(b.entities[i].position.x);
        expect(a.entities[i].position.y).toBe(b.entities[i].position.y);
      }
    });

    test('sempre existe exatamente um Wumpus e um Gold', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const w = WorldFactory.createRandomWorld({ seed });
        const wumpi = w.entities.filter(e => e.type === EntityType.WUMPUS);
        const golds = w.entities.filter(e => e.type === EntityType.GOLD);
        expect(wumpi.length).toBe(1);
        expect(golds.length).toBe(1);
      }
    });

    test('Wumpus e Gold nunca em (0,0)', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const w = WorldFactory.createRandomWorld({ seed, pitProbability: 0.2 });
        for (const e of w.entities) {
          if (e.type === EntityType.WUMPUS || e.type === EntityType.GOLD) {
            expect(e.position.x === 0 && e.position.y === 0).toBe(false);
          }
        }
      }
    });

    test('não gera poço em (0,0)', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const w = WorldFactory.createRandomWorld({ seed, pitProbability: 0.9 });
        for (const e of w.entities) {
          if (e.type === EntityType.PIT) {
            expect(e.position.x === 0 && e.position.y === 0).toBe(false);
          }
        }
      }
    });

    test('rejeita gridSize menor que 4', () => {
      expect(() => WorldFactory.createRandomWorld({ gridSize: 3 })).toThrow();
    });
  });
});
