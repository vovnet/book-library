import { GameObjects, Geom, Scene, Tweens } from "phaser";
import { emitEvent } from "../core/EventBus";
import { Book } from "./Book";

export class Slot extends GameObjects.Container {
  public id: string;
  public book: Book | null = null;

  public readonly bookcaseIndex: number;
  public readonly shelfIndex: number;

  private highlightBorder: GameObjects.Rectangle;
  private highlightTween: Tweens.Tween | null = null;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    id: string,
    bookcaseIndex: number, // 🌟 Новый параметр
    shelfIndex: number,
  ) {
    super(scene, x, y);
    this.id = id;
    this.bookcaseIndex = bookcaseIndex;
    this.shelfIndex = shelfIndex;

    const bg = scene.add.rectangle(0, 0, 18, 32, 0x000000, 0.1);
    this.add(bg);

    this.highlightBorder = scene.add.rectangle(0, 0, 18, 32, 0x000000, 0);
    this.highlightBorder.setStrokeStyle(2, 0xffffff);
    this.highlightBorder.setVisible(false);
    this.add(this.highlightBorder);

    this.setInteractive(new Geom.Rectangle(-9, -16, 18, 32), Geom.Rectangle.Contains);
    this.on("pointerdown", () => emitEvent("slot-clicked", this));
  }

  public setBook(book: Book | null) {
    this.book = book;
  }

  public setHighlight(active: boolean) {
    if (active && !this.highlightTween) {
      this.highlightBorder.setVisible(true);
      this.highlightTween = this.scene.tweens.add({
        targets: this.highlightBorder,
        alpha: { from: 0.3, to: 1 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else if (!active) {
      this.highlightBorder.setVisible(false);
      this.highlightTween?.stop();
      this.highlightTween = null;
      this.highlightBorder.setAlpha(0);
    }
  }

  public destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
