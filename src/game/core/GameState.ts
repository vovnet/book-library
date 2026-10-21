import { Utils } from "phaser";
import { emitEvent } from "./EventBus";
import { BoosterId } from "../registers/boosters";
import { ResourceId } from "../registers/resources";

export interface GameStateData {
  level: number;
  handSize: number;
  boosters: Record<BoosterId, number>;
  resources: Record<ResourceId, number>;
}

const defaultState: GameStateData = {
  level: 1,
  handSize: 1,
  boosters: { hand: 5, magnetto: 5, intuition: 5, hardIntuition: 5 },
  resources: { "1": 4, "2": 5, "3": 0, "4": 0, "5": 0, "6": 0 },
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

  get handSize() {
    return this.data.handSize;
  }

  public addHandSize(value: number) {
    this.data.handSize += value;
    this.emitDataChanged();
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

  getResource(id: ResourceId) {
    return this.data.resources[id];
  }

  addResource(id: ResourceId, value: number) {
    this.data.resources[id] += value;
    this.emitDataChanged();
  }

  addResources(resources: Record<ResourceId, number>) {
    for (const [id, amount] of Object.entries(resources)) {
      if (amount <= 0) continue;
      this.addResource(id as ResourceId, amount);
    }
  }

  public getBoosterCount(id: BoosterId): number {
    return this.data.boosters[id] ?? 0;
  }

  public useBooster(id: BoosterId): boolean {
    if (this.getBoosterCount(id) <= 0) return false;
    this.data.boosters[id]--;
    this.emitDataChanged;
    return true;
  }

  public addBooster(id: BoosterId, amount: number = 1): void {
    if (!this.data.boosters[id]) this.data.boosters[id] = 0;
    this.data.boosters[id] += amount;
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
