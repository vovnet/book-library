import { Utils } from "phaser";
import { emitEvent } from "./EventBus";

export interface GameStateData {
  level: number;
  boosters: { hand: number; magnito: number; intuition: number; hardIntuition: number };
}

const defaultState: GameStateData = {
  level: 1,
  boosters: { hand: 5, magnito: 5, intuition: 5, hardIntuition: 5 },
};

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

  serialize(): GameStateData {
    return Utils.Objects.DeepCopy(this.data) as GameStateData;
  }

  deserialize(data: Partial<GameStateData>) {
    this.data = { ...this.data, ...data, boosters: { ...this.data.boosters, ...data.boosters } };
    emitEvent("game-state-data-changed");
  }
}
