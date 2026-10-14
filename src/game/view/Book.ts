import * as Phaser from "phaser";
import { emitEvent } from "../core/EventBus";

export class Book extends Phaser.GameObjects.Container {
  public id: string;
  public location: "floor" | "hand" | "slot";

  private visual: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
    super(scene, x, y);
    this.id = id;
    this.location = "floor";

    // Визуал живет ВНУТРИ модели
    this.visual = scene.add.rectangle(0, 0, 18, 32, 0x8b4513);
    // this.visual.setStrokeStyle(2, 0xffffff);
    this.add(this.visual);

    this.visual.setInteractive();
    this.visual.once("pointerdown", () => emitEvent("book-picked-up", this));
  }

  // Модель сама знает, как себя показать
  public flyTo(x: number, y: number, duration = 400): Promise<void> {
    return new Promise((resolve) => {
      this.setDepth(1000);
      this.scene.tweens.add({
        targets: this,
        x,
        y,
        rotation: 0,
        scale: 1.0,
        duration,
        ease: "Back.out",
        onComplete: () => {
          this.setDepth(10);
          resolve();
        },
      });
    });
  }

  public highlight() {
    this.visual.setStrokeStyle(3, 0xffff00);
  }
}
