import { GameState } from "../core/GameState";
import { CloudSaveProvider } from "../storage/CloudSaveProvider";
import { GameSession } from "../storage/GameSession";
import { LocalSaveProvider } from "../storage/LocalSaveProvider";
import { SaveManager } from "../storage/SaveManager";

class GlobalGame {
  public readonly gameState: GameState;
  public readonly saveManager: SaveManager;

  private isLoaded = false;

  constructor() {
    this.gameState = new GameState();
    this.gameState.init();

    this.saveManager = new SaveManager(
      new GameSession(this.gameState),
      new LocalSaveProvider(),
      new CloudSaveProvider(),
    );
  }

  async init() {
    if (this.isLoaded) {
      return;
    }

    await this.saveManager.loadIntoSession();
    this.isLoaded = true;
  }
}

export const globalGame = new GlobalGame();
