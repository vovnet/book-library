import { Scene } from "phaser";

export class Main extends Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  async preload() {}

  async create() {
    this.scene.launch("LevelMap");
  }
}
