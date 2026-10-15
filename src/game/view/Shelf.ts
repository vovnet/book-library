import { Scene, GameObjects, Geom } from "phaser";
import { emitEvent } from "../core/EventBus";

export class Shelf {
  public readonly bookcaseIndex: number; // 🌟 Добавляем индекс шкафа
  public readonly shelfIndex: number;
  private outline: GameObjects.Graphics;
  private scene: Scene;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    bookcaseIndex: number,
    shelfIndex: number,
  ) {
    this.scene = scene;
    this.bookcaseIndex = bookcaseIndex;
    this.shelfIndex = shelfIndex;

    // Создаем и настраиваем контур
    this.outline = scene.add.graphics();
    this.outline.lineStyle(2, 0xffff00, 1); // Желтая линия, толщина 3px
    this.outline.strokeRect(x, y, width, height);
    this.outline.setVisible(false); // Скрыт по умолчанию
    this.outline.setDepth(20); // Выше слотов (10), но ниже книг в руке (100+)

    const hitArea = new Geom.Rectangle(x, y, width, height);
    this.outline.setInteractive(hitArea, Geom.Rectangle.Contains, true); // true = курсор-рука

    // 🌟 2. ОТПРАВЛЯЕМ СОБЫТИЕ ПРИ КЛИКЕ
    this.outline.on("pointerdown", () => {
      emitEvent("shelf-clicked", this);
    });
  }

  // 🌟 Включить или выключить подсветку
  public setHighlight(active: boolean): void {
    this.outline.setVisible(active);
  }

  public containsId(id: string): boolean {
    const parts = id.split("-");
    if (parts.length >= 4) {
      const targetBookcaseIndex = parseInt(parts[1].replace("b", ""), 10);
      const targetShelfIndex = parseInt(parts[2].replace("sh", ""), 10);

      return targetBookcaseIndex === this.bookcaseIndex && targetShelfIndex === this.shelfIndex;
    }
    return false;
  }

  // 🌟 Очистка памяти при уничтожении
  public destroy(): void {
    this.outline.destroy();
  }
}
