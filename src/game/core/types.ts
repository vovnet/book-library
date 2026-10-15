import { HandLayoutStrategy } from "./HandStrategies";
import { Slot } from "../view/Slot";
import { GameEvents } from "./EventBus";

export type Location = "floor" | "hand" | "slot";

export type TargetResolver = (source: any) => Slot[] | null;

export type HighlightMode = "slots" | "shelves" | "bookcases";

export interface LevelConfig {
  pickupStrategy: HandLayoutStrategy;
  placementEventName: keyof GameEvents;
  resolveTargets: TargetResolver;
  highlightMode: HighlightMode;
}
