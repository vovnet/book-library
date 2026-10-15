import { Scene, GameObjects, Geom } from "phaser";
import { emitEvent } from "../core/EventBus";

export class Shelf {
  public readonly index: number;
  private outline: GameObjects.Graphics;
  private scene: Scene;

  constructor(scene: Scene, x: number, y: number, width: number, height: number, index: number) {
    this.scene = scene;
    this.index = index;

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

  // 🌟 Проверяет, принадлежит ли книга этой полке
  public containsBook(bookId: string): boolean {
    // bookId имеет вид "r0-b0-sh2-sl3"
    // Извлекаем индекс полки из ID книги
    const parts = bookId.split("-");
    const bookShelfIndex = parseInt(parts[2].replace("sh", ""), 10);

    return bookShelfIndex === this.index;
  }

  public containsId(id: string): boolean {
    const parts = id.split("-");
    if (parts.length >= 3) {
      const targetShelfIndex = parseInt(parts[2].replace("sh", ""), 10);
      return targetShelfIndex === this.index;
    }
    return false;
  }

  // 🌟 Очистка памяти при уничтожении
  public destroy(): void {
    this.outline.destroy();
  }
}
