export type ResourceId = "1" | "2" | "3" | "4" | "5" | "6";

export interface ResourceDef {
  id: ResourceId;
  name: string;
  description?: string;
  iconKey?: string;
}

const map = [
  { id: "1", name: "", description: "" },
  { id: "2", name: "", description: "" },
  { id: "3", name: "", description: "" },
  { id: "4", name: "", description: "" },
  { id: "5", name: "", description: "" },
  { id: "6", name: "", description: "" },
].map((item) => [item.id, item] as [ResourceId, ResourceDef]);

export const resources: Map<ResourceId, ResourceDef> = new Map(map);
