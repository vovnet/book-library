export type BoosterId = "hand" | "magnetto" | "intuition" | "hardIntuition";

export interface BoosterDef {
  id: BoosterId;
  name: string;
  description?: string;
  iconKey?: string;
}

const map = [
  { id: "hand", name: "Большая охапка", description: "" },
  { id: "magnetto", name: "Притяжение", description: "" },
  { id: "intuition", name: "Быстрая выкладка", description: "" },
  { id: "hardIntuition", name: "Автораскладка", description: "" },
].map((item) => [item.id, item] as [BoosterId, BoosterDef]);

export const boosters: Map<BoosterId, BoosterDef> = new Map(map);
