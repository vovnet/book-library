import * as Phaser from "phaser";
import { emitEvent } from "../core/EventBus";

const BOOK_COLORS = [
  0x8b4513, // Коричневый (SaddleBrown)
  0xa52a2a, // Красно-коричневый
  0x2f4f4f, // Темный аспидно-серый
  0x556b2f, // Темный оливковый
  0x800000, // Бордовый (Maroon)
  0xff7373, // Темно-синий
  0x4b0082, // Индиго
  0x8b0000, // Темно-красный
  0xd2691e,
  0x2e8b57,
  0x483d8b,
  0x006363,
  0xcd853f,
  0x009999,
  0x992667,
];

export class Book extends Phaser.GameObjects.Container {
  public id: string;
  public location: "floor" | "hand" | "slot";

  private visual: Phaser.GameObjects.Rectangle;

  private levitationTween: Phaser.Tweens.Tween | null = null;
  private baseY: number = 0;

  private slideTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
    super(scene, x, y);
    this.id = id;
    this.location = "floor";

    const parts = id.split("-");
    const bookcaseIndex = parseInt(parts[1].replace("b", ""), 10);

    const colorIndex = bookcaseIndex % BOOK_COLORS.length;
    const bookColor = BOOK_COLORS[colorIndex];

    // Визуал живет ВНУТРИ модели
    this.visual = scene.add.rectangle(0, 0, 18, 32, bookColor);
    // this.visual.setStrokeStyle(2, 0xffffff);
    this.visual.setStrokeStyle(1, 0x000000, 0.3);
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

  public celebrate(liftHeight: number = 8, duration: number = 200) {
    return new Promise((resolve) => {
      const originalY = this.y;

      this.scene.tweens.add({
        targets: this,
        y: originalY - liftHeight,
        scale: 1.15, // 🌟 Чуть увеличиваем в момент подъема
        duration: duration / 2,
        yoyo: true,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(true),
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

  public slideTo(x: number, y: number, duration: number = 250): Promise<void> {
    return new Promise((resolve) => {
      // Останавливаем предыдущий slideTo, если он был
      if (this.slideTween) {
        this.slideTween.stop();
      }

      this.slideTween = this.scene.tweens.add({
        targets: this,
        x,
        duration,
        ease: "Power2",
        onComplete: () => {
          this.slideTween = null;
          resolve();
        },
      });
    });
  }

  public stopLevitation() {
    if (this.levitationTween) {
      this.levitationTween.stop();
      this.levitationTween = null;
      this.y = this.baseY;
    }
  }

  public highlight(isVisible = true) {
    this.visual.setStrokeStyle(3, 0xffff00, isVisible ? 1 : 0);
  }
}
