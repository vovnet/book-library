import * as Phaser from "phaser";
import { ShelfSlot } from "../core/types";
import { SLOT_HEIGHT, SLOT_WIDTH } from "../core/libConfig";

export class SlotView extends Phaser.GameObjects.Container {
  public slotData: ShelfSlot;
  public currentBook: Phaser.GameObjects.Sprite | null = null;

  // Элемент для мигающей рамки
  private highlightBorder: Phaser.GameObjects.Rectangle;
  private highlightTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, slotData: ShelfSlot) {
    super(scene, x, y);
    this.slotData = slotData;

    // 1. Едва заметная подложка (чтобы задавать область, alpha можно поставить 0)
    const bg = scene.add.rectangle(0, 0, SLOT_WIDTH, SLOT_HEIGHT, 0x5c4033, 0.1);
    this.add(bg);

    // 2. Мигающая рамка (изначально скрыта)
    // Делаем её чуть больше слота (padding = 4), чтобы рамка была снаружи
    const padding = 4;
    this.highlightBorder = scene.add.rectangle(
      0,
      0,
      SLOT_WIDTH + padding * 2,
      SLOT_HEIGHT + padding * 2,
      0x000000,
      0, // Цвет и альфа заливки не важны, важна обводка
    );
    this.highlightBorder.setStrokeStyle(2, 0xffffff); // Белая рамка толщиной 2px
    this.highlightBorder.setAlpha(0); // Скрываем по умолчанию
    this.add(this.highlightBorder);

    // 3. Делаем ВЕСЬ контейнер интерактивным для кликов.
    // Явно задаем область попадания, чтобы клики работали даже при alpha = 0 у фона
    this.setInteractive(
      new Phaser.Geom.Rectangle(-SLOT_WIDTH / 2, -SLOT_HEIGHT / 2, SLOT_WIDTH, SLOT_HEIGHT),
      Phaser.Geom.Rectangle.Contains,
    );
  }

  // Поместить книгу в слот (или убрать её, передав null)
  public setBook(bookView: Phaser.GameObjects.Sprite | null) {
    if (this.currentBook) {
      this.remove(this.currentBook);
      this.currentBook.destroy();
    }
    this.currentBook = bookView;
    if (bookView) {
      this.add(bookView);
    }
  }

  // Включить/выключить мигающую подсветку-подсказку
  public setHighlight(isActive: boolean) {
    if (isActive) {
      // Если твин уже запущен, не создаем новый (защита от наложения)
      if (!this.highlightTween) {
        this.highlightTween = this.scene.tweens.add({
          targets: this.highlightBorder,
          alpha: { from: 0.3, to: 1 }, // Мигание от 30% до 100% видимости
          duration: 600, // Скорость мигания (мс)
          yoyo: true, // Туда и обратно
          repeat: -1, // Бесконечно
          ease: "Sine.easeInOut", // Плавная анимация
        });
      }
    } else {
      // Останавливаем анимацию и скрываем рамку
      if (this.highlightTween) {
        this.highlightTween.stop();
        this.highlightTween = null;
      }
      this.highlightBorder.setAlpha(0);
    }
  }

  // ВАЖНО: Очищаем твин при уничтожении слота, чтобы не было утечек памяти
  public destroy(fromScene?: boolean): void {
    this.setHighlight(false); // Гарантированно останавливаем твин
    super.destroy(fromScene);
  }
}
