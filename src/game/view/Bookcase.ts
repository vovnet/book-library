import { Scene, GameObjects, Geom, Actions } from "phaser";
import { emitEvent } from "../core/EventBus";

export class Bookcase {
  public readonly bookcaseIndex: number;
  private outline: GameObjects.Graphics;
  private scene: Scene;
  private background: GameObjects.Image;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    bookcaseIndex: number,
    background: GameObjects.Image,
  ) {
    this.scene = scene;
    this.bookcaseIndex = bookcaseIndex;
    this.background = background;

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

  public shine(): void {
    const duration = 3800;
    Actions.AddEffectShine([this.background], {
      duration, // Длительность анимации в мс
      radius: 0.35, // Ширина полосы блика (как доля от размера цели, 0.35 = 35%)
      direction: 1, // Направление: 0 = вправо, 0.5 = вниз, 0.75 = по диагонали (сверху-слева вниз-вправо)
      scale: 2.5, // Длина пути блика относительно размера цели (с запасом, чтобы пролетел насквозь)
      colorFactor: [1.8, 1.8, 1.8, 1], // Множитель яркости (R, G, B, A). Значения > 1 дают эффект реального свечения
      ease: "Power2", // Плавный разгон и торможение
      yoyo: false, // false = пролетает один раз и исчезает (не дергается туда-сюда)
      useExternal: false, // false = эффект привязан к самому объекту, а не к экрану
    });

    this.scene.time.delayedCall(duration, () => {
      if (this.background.filters && this.background.filters.internal) {
        // Очищаем все внутренние фильтры (включая Shine)
        this.background.filters.internal.clear();
      }
    });
  }

  public destroy(): void {
    this.outline.destroy();
  }
}
