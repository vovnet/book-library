import { Scene } from "phaser";
import { GameSession } from "../storage/GameSession";
import { GameState } from "../core/GameState";
import { SaveManager } from "../storage/SaveManager";
import { LocalSaveProvider } from "../storage/LocalSaveProvider";
import { CloudSaveProvider } from "../storage/CloudSaveProvider";

export class Main extends Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  async create() {
    const gameState = new GameState();
    gameState.init();

    const saveManager = new SaveManager(
      new GameSession(gameState),
      new LocalSaveProvider(),
      new CloudSaveProvider(),
    );
    await saveManager.loadIntoSession();

    this.game.registry.set("gameState", gameState);
    this.game.registry.set("saveManager", saveManager);

    this.scene.launch("LevelMap");
    saveManager.save();
  }
}
