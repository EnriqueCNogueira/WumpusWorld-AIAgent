import { WumpusWorldAPI } from '../api/WumpusWorldAPI';

export class AIAgentAdapter {
  constructor(private api: WumpusWorldAPI) {}

  public executeCommand(commandLine: string): string {
    const cmd = commandLine.trim().toUpperCase();
    let success = false;

    if (cmd.startsWith('MOVE_')) {
      const direction = cmd.split('_')[1].toLowerCase() as 'up' | 'down' | 'left' | 'right';
      if (['up', 'down', 'left', 'right'].includes(direction)) {
        success = this.api.move(direction);
      } else {
        return `ERROR: Invalid direction. Use MOVE_UP, MOVE_DOWN, MOVE_LEFT, or MOVE_RIGHT.`;
      }
    } else {
      switch (cmd) {
        case 'SHOOT':
          success = this.api.shoot();
          break;
        case 'GRAB_GOLD':
          success = this.api.grabGold();
          break;
        case 'EXIT':
          success = this.api.exitCavern();
          break;
        default:
          return `ERROR: Unknown command '${cmd}'.`;
      }
    }

    return success ? `SUCCESS: '${cmd}' executed.` : `FAILURE: '${cmd}' failed (e.g., hit a wall, no arrows).`;
  }

  public getEnvironmentContext(): string {
    const state = this.api.getPlayerState();
    const perceptions = this.api.getPerceptions();
    const history = this.api.getRecentHistory(5);

    const contextPayload = {
      player_state: state,
      current_perceptions: perceptions,
      recent_history: history
    };

    return JSON.stringify(contextPayload, null, 2);
  }
}