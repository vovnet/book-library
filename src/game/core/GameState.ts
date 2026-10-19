import { Utils } from "phaser";
import { emitEvent } from "./EventBus";

export interface GameStateData {
  level: number;
  boosters: Record<string, number>;
  resources: Record<string, number>;
}

const defaultState: GameStateData = {
  level: 1,
  boosters: { hand: 5, magnito: 5, intuition: 5, hardIntuition: 5 },
  resources: { zalupa: 34 },
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

  get resources() {
    return this.data.resources;
  }

  set level(val: number) {
    if (val === this.data.level) {
      return;
    }

    this.data.level = val;
    emitEvent("level-changed", this.data.level);
    this.emitDataChanged();
  }

  set resources(resources: Record<string, number>) {
    this.data.resources = resources;
    this.emitDataChanged();
  }

  getResource(name: string) {
    return this.data.resources[name];
  }

  setResource(name: string, value: number) {
    this.data.resources[name] = value;
    this.emitDataChanged();
  }

  serialize(): GameStateData {
    return Utils.Objects.DeepCopy(this.data) as GameStateData;
  }

  deserialize(data: Partial<GameStateData>) {
    this.data = {
      ...this.data,
      ...data,
      boosters: { ...this.data.boosters, ...data.boosters },
      resources: { ...this.data.resources, ...data.resources },
    };
    this.emitDataChanged();
  }

  private emitDataChanged() {
    emitEvent("game-state-data-changed");
  }
}
