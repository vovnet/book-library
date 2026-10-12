import * as Phaser from "phaser";
import { Book } from "../core/types"; // Укажите правильный путь к вашим типам
import { BookView } from "./BookView"; // Укажите правильный путь к классу BookView

export class FloorView extends Phaser.GameObjects.Container {
  private bookViews: Map<string, BookView> = new Map();
  private bgGraphics!: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    books: Book[],
    onBookClick: (book: BookView) => void,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.width = width;
    this.height = height;

    // 1. Рисуем фон пола (чтобы видеть границы, можно сделать прозрачным или текстурированным)
    this.bgGraphics = scene.add.graphics();
    this.bgGraphics.fillStyle(0x8b4513, 0.15); // Коричневый, полупрозрачный
    this.bgGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    this.bgGraphics.lineStyle(2, 0x5d4037, 0.5);
    this.bgGraphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    this.add(this.bgGraphics);

    // 2. Создаем и разбрасываем книги
    const padding = 40; // Отступ от краев, чтобы книги не вылезали за границы

    books.forEach((book) => {
      // Случайная позиция внутри контейнера (с учетом отступов)
      const randomX = Phaser.Math.Between(-width / 2 + padding, width / 2 - padding);
      const randomY = Phaser.Math.Between(-height / 2 + padding, height / 2 - padding);

      // Случайный угол поворота для эффекта "беспорядка" (от -30 до 30 градусов)
      const randomRotation = Phaser.Math.DegToRad(Phaser.Math.Between(-30, 30));

      // Создаем визуальное представление книги
      const bookView = new BookView(scene, {
        x: randomX,
        y: randomY,
        model: book,
        color: 0xaa4,
        width: 20,
        height: 30,
        symbol: "a",
        onClick: onBookClick,
      });
      bookView.setRotation(randomRotation);

      // Добавляем в контейнер пола и сохраняем ссылку
      this.add(bookView);
      this.bookViews.set(book.id, bookView);
    });
  }

  /**
   * Удаляет книгу с пола визуально (например, когда игрок взял её в руку)
   */
  public removeBookFromFloor(bookId: string): void {
    const bookView = this.bookViews.get(bookId);
    if (bookView) {
      // Можно добавить анимацию исчезновения перед удалением
      this.scene.tweens.add({
        targets: bookView,
        alpha: 0,
        scale: 0.5,
        duration: 200,
        onComplete: () => {
          bookView.destroy();
          this.bookViews.delete(bookId);
        },
      });
    }
  }

  /**
   * Правильная очистка ресурсов при уничтожении сцены
   */
  public destroy(fromScene?: boolean): void {
    this.bookViews.forEach((view) => view.destroy());
    this.bookViews.clear();
    super.destroy(fromScene);
    this.bgGraphics.destroy();
  }
}
