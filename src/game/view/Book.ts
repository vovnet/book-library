import * as Phaser from "phaser";
import { emitEvent } from "../core/EventBus";
import { BOOK_COLORS, BookState } from "../generators/BookTextereGenerator";

export class Book extends Phaser.GameObjects.Sprite {
  public id: string;
  public location: "floor" | "hand" | "slot";

  private levitationTween: Phaser.Tweens.Tween | null = null;
  private baseY: number = 0;

  private slideTween: Phaser.Tweens.Tween | null = null;
  private colorIndex: number;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
    const parts = id.split("-");
    const bookcaseIndex = parseInt(parts[1].replace("b", ""), 10);

    const colorIndex = bookcaseIndex % BOOK_COLORS.length;

    super(scene, x, y, `book-floor-${colorIndex}`);
    this.id = id;
    this.location = "floor";
    this.colorIndex = colorIndex;

    this.setInteractive();
    this.on("pointerdown", () => emitEvent("book-picked-up", this));
    this.on("pointerover", () => {
      emitEvent("book-hovered", this);
    });
  }

  public removePickupEvents() {
    this.off("pointerdown");
    this.off("pointerover");
    this.off("pointerout");
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

  public setLocation(newLocation: "floor" | "hand" | "slot"): void {
    this.location = newLocation;

    this.setTexture(`book-${newLocation}-${this.colorIndex}`);
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
}
