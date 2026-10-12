import * as Phaser from "phaser";
import { Book } from "../core/types";

export interface BookViewConfig {
  model: Book;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  symbol: string; // например: "A", "B", ""
}

export class BookView extends Phaser.GameObjects.Container {
  public model: Book;

  private bg: Phaser.GameObjects.Graphics;
  private symbolText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: BookViewConfig) {
    super(scene, config.x, config.y);

    this.model = config.model;

    // Фон книги
    this.bg = scene.add.graphics();
    this.bg.fillStyle(config.color, 1);
    this.bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 4);
    this.bg.lineStyle(2, 0x000000, 1);
    this.bg.strokeRoundedRect(
      -config.width / 2,
      -config.height / 2,
      config.width,
      config.height,
      4,
    );
    this.add(this.bg);

    // Символ на книге
    this.symbolText = scene.add
      .text(0, 0, config.symbol, {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add(this.symbolText);

    this.setSize(config.width, config.height);
  }

  // Метод для подсветки (например, при наведении)
  public setHighlight(enabled: boolean): void {
    if (enabled) {
      this.bg.lineStyle(3, 0xffff00, 1); // Желтая рамка
    } else {
      this.bg.lineStyle(2, 0x000000, 1); // Черная рамка
    }
  }
}
