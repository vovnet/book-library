import { ResourceId } from "../registers/resources";
import { Slot } from "../view/Slot";
import { GameEvents } from "./EventBus";

export type Location = "floor" | "hand" | "slot";

export type TargetResolver = (source: any) => Slot[] | null;

export type HighlightMode = "slots" | "shelves" | "bookcases";

export interface LevelConfig {
  pickupStrategy: "byClick" | "byHover";
  placementEventName: keyof GameEvents;
  highlightMode: HighlightMode;
  maxBooks: number;
  resolveTargets?: TargetResolver;
  resources?: LevelResourceConfig[];
}

export interface LevelResourceConfig {
  id: ResourceId;
  amount: number;
}
