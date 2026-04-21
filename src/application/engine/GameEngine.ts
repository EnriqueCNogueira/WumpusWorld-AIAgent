import { Grid } from '../../domain/entities/Grid';
import { Player } from '../../domain/entities/Player';
import { IEntity } from '../../domain/interfaces/IEntity';
import { PerceptionSystem } from '../systems/PerceptionSystem';

export class GameEngine {
  private static instance: GameEngine;

  private _grid!: Grid;
  private _player!: Player;
  private _entities: IEntity[] = [];
  private _perceptionSystem: PerceptionSystem;

  private constructor() {
    this._perceptionSystem = new PerceptionSystem();
  }

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  public initialize(gridSize: number, player: Player, entities: IEntity[]): void {
    this._grid = new Grid(gridSize);
    this._player = player;
    this._entities = entities;
  }

  public get grid(): Grid {
    return this._grid;
  }

  public get player(): Player {
    return this._player;
  }

  public get entities(): ReadonlyArray<IEntity> {
    return this._entities;
  }

  public get perceptionSystem(): PerceptionSystem {
    return this._perceptionSystem;
  }

  // Novo: Limpeza de estado em memória
  public clear(): void {
    this._grid = undefined as unknown as Grid;
    this._player = undefined as unknown as Player;
    this._entities = [];
    // Reinicia o sistema de percepções para remover todos os observers antigos
    this._perceptionSystem = new PerceptionSystem();
  }

  // Refatorado: Utiliza a limpeza de estado sem quebrar o Singleton
  public resetStateForTesting(): void {
    this.clear();
  }
}