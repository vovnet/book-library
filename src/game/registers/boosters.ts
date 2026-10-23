export type BoosterId = "hand" | "magnetto" | "intuition" | "hardIntuition";

export interface BoosterDef {
  id: BoosterId;
  name: string;
  description?: string;
  iconKey?: string;
}

const map = [
  { id: "hand", name: "Большая охапка", description: "", iconKey: "boost-1" },
  { id: "magnetto", name: "Притяжение", description: "", iconKey: "boost-2" },
  { id: "intuition", name: "Быстрая выкладка", description: "", iconKey: "boost-3" },
  { id: "hardIntuition", name: "Автораскладка", description: "", iconKey: "boost-4" },
].map((item) => [item.id, item] as [BoosterId, BoosterDef]);

export const boosters: Map<BoosterId, BoosterDef> = new Map(map);
