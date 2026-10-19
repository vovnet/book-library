import { Scene } from "phaser";

export class Main extends Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {}

  create() {
    this.scene.launch("LevelMap");
    this.scene.launch("UIScene");
  }
}
