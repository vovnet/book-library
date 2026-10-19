import { GameStateData } from "../core/GameState";

export interface SaveProvider {
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
  clear(): Promise<void>;
}

export interface SaveData {
  version: string;
  updatedAt: number;
  gameState: GameStateData;
}
