import { GameState } from "../core/GameState";
import { SaveData } from "./types";

export class GameSession {
  constructor(public readonly gameState: GameState) {}

  public createSaveData(): SaveData {
    return {
      version: "1",
      updatedAt: Date.now(),

      gameState: this.gameState.serialize(),
    };
  }

  public restoreSaveData(data: SaveData): void {
    this.gameState.deserialize(data.gameState);
  }
}
