import { emitEvent } from "./EventBus";

export interface GameStateData {
  level: number;
}

const defaultState: GameStateData = { level: 1 };

export class GameState {
  private data: GameStateData;

  constructor() {}

  public init(data = defaultState) {
    this.data = data;
  }

  get level() {
    return this.data.level;
  }

  set level(val: number) {
    if (val === this.data.level) {
      return;
    }

    this.data.level = val;
    emitEvent("level-changed", this.data.level);
  }

  serialize() {
    return { ...this.data };
  }

  deserialize(data: Partial<GameStateData>) {
    this.data = { ...this.data, ...data };
    emitEvent("game-state-data-changed");
  }
}
