import { Scene } from "phaser";
import { globalGame } from "../global/GlobalGame";

export class Main extends Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {}

  create() {
    globalGame.gameState.addBooster("magnetto", 20);
    globalGame.gameState.addBooster("hand", 20);
    globalGame.gameState.addBooster("hardIntuition", 20);

    this.scene.launch("LevelMap");
    this.scene.launch("UIScene");
  }
}
