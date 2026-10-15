import { Scene, GameObjects, Geom } from "phaser";
import { emitEvent } from "../core/EventBus";

export class Bookcase {
  public readonly bookcaseIndex: number;
  private outline: GameObjects.Graphics;
  private scene: Scene;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    bookcaseIndex: number,
  ) {
    this.scene = scene;
    this.bookcaseIndex = bookcaseIndex;

    // Контур будет рисоваться вокруг всего шкафа
    this.outline = scene.add.graphics();
    this.outline.lineStyle(3, 0xffffff, 0.7);
    this.outline.strokeRect(x, y, width, height);
    this.outline.setVisible(false);
    this.outline.setDepth(20);

    // Изначально не кликабельный
    this.outline.setInteractive(
      new Geom.Rectangle(x, y, width, height),
      Geom.Rectangle.Contains,
      true,
    );
    this.outline.disableInteractive();

    this.outline.on("pointerdown", () => {
      emitEvent("bookcase-clicked", this);
    });
  }

  public setHighlight(active: boolean): void {
    this.outline.setVisible(active);
    if (active) {
      this.outline.setInteractive();
    } else {
      this.outline.disableInteractive();
    }
  }

  public containsId(id: string): boolean {
    const parts = id.split("-");
    if (parts.length >= 2) {
      const targetBookcaseIndex = parseInt(parts[1].replace("b", ""), 10);
      return targetBookcaseIndex === this.bookcaseIndex;
    }
    return false;
  }

  public destroy(): void {
    this.outline.destroy();
  }
}
