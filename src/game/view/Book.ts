import * as Phaser from "phaser";
import { emitEvent } from "../core/EventBus";

export class Book extends Phaser.GameObjects.Container {
  public id: string;
  public location: "floor" | "hand" | "slot";

  private visual: Phaser.GameObjects.Rectangle;

  private levitationTween: Phaser.Tweens.Tween | null = null;
  private baseY: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
    super(scene, x, y);
    this.id = id;
    this.location = "floor";

    // Визуал живет ВНУТРИ модели
    this.visual = scene.add.rectangle(0, 0, 18, 32, 0x8b4513);
    // this.visual.setStrokeStyle(2, 0xffffff);
    this.add(this.visual);

    this.visual.setInteractive();
    this.visual.on("pointerdown", () => emitEvent("book-picked-up", this));
    this.visual.on("pointerover", () => {
      // this.visual.setStrokeStyle(1, 0xffff00, 1);
      emitEvent("book-hovered", this);
    });

    this.visual.on("pointerout", () => {
      // this.visual.setStrokeStyle(2, 0xffffff, 0);
    });
  }

  public removePickupEvents() {
    this.visual.off("pointerdown");
    this.visual.off("pointerover");
    this.visual.off("pointerout");
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

  public startLevitation(amplitude: number = 4, duration: number = 1200) {
    this.stopLevitation();
    this.baseY = this.y;

    // Случайная задержка, чтобы книги не качались в унисон
    const delay = Phaser.Math.Between(0, duration);

    this.levitationTween = this.scene.tweens.add({
      targets: this,
      y: "+=10",
      duration: duration / 2,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay,
    });
  }

  public stopLevitation() {
    if (this.levitationTween) {
      this.levitationTween.stop();
      this.levitationTween = null;
    }
  }

  public highlight(isVisible = true) {
    this.visual.setStrokeStyle(3, 0xffff00, isVisible ? 1 : 0);
  }
}
