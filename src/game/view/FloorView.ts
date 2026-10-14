import * as Phaser from "phaser";
import { Book } from "../core/types";
import { BookView } from "./Book";
import { emitEvent } from "../core/EventBus";

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
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    // 1. Рисуем фон пола
    this.bgGraphics = scene.add.graphics();
    this.bgGraphics.fillStyle(0x8b4513, 0.15);
    this.bgGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    this.bgGraphics.lineStyle(2, 0x5d4037, 0.5);
    this.bgGraphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    this.add(this.bgGraphics);

    // 2. Создаем и разбрасываем книги
    const padding = 40;

    books.forEach((book) => {
      const randomX = Phaser.Math.Between(-width / 2 + padding, width / 2 - padding);
      const randomY = Phaser.Math.Between(-height / 2 + padding, height / 2 - padding);
      const randomRotation = Phaser.Math.DegToRad(Phaser.Math.Between(-30, 30));

      const bookView = new BookView(scene, randomX, randomY, book);
      bookView.setRotation(randomRotation);

      // 🌟 Ловим клик прямо здесь, чтобы управлять визуальным перемещением
      bookView.on("pointerdown", () => {
        this.handleBookPickup(bookView);
      });

      this.add(bookView);
      this.bookViews.set(book.id, bookView);
    });
  }

  // 🌟 МАГИЯ ПОЛЕТА КНИГИ В РУКУ
  private handleBookPickup(bookView: BookView) {
    const bookId = bookView.model.id;

    // Шаг 1: Получаем текущие ГЛОБАЛЬНЫЕ координаты книги
    const worldPoint = bookView.getWorldPoint(new Phaser.Math.Vector2());

    // Шаг 2: "Вырываем" книгу из контейнера пола и добавляем прямо в сцену.
    // Теперь её x и y глобальны, и анимация в центр экрана сработает корректно!
    this.remove(bookView);
    this.scene.add.existing(bookView);

    // Шаг 3: Возвращаем её на те же глобальные координаты, чтобы не было визуального скачка
    bookView.setPosition(worldPoint.x, worldPoint.y);

    // Шаг 4: Поднимаем на передний план, чтобы она летела ПОВЕРХ всех шкафов
    bookView.setDepth(1000);

    // Шаг 5: Запускаем анимацию полета в центр экрана (или чуть ниже, в зону "руки")
    const targetX = this.scene.cameras.main.centerX;
    const targetY = this.scene.cameras.main.centerY + 200; // Зона руки внизу центра

    this.scene.tweens.add({
      targets: bookView,
      x: targetX,
      y: targetY,
      rotation: 0, // Выравниваем книгу, чтобы она стояла ровно
      scale: 1.2, // Чуть увеличиваем, показывая, что она теперь "в руке"
      duration: 400,
      ease: "Back.out", // Красивая анимация с легким "влетанием" в цель
      onComplete: () => {
        // Шаг 6: Сообщаем шине событий, что книга успешно долетела
        emitEvent("book-picked-up", bookId);

        // Удаляем из маппинга пола, так как она теперь управляется сценой/рукой
        this.bookViews.delete(bookId);
      },
    });
  }

  public destroy(fromScene?: boolean): void {
    this.bookViews.forEach((view) => view.destroy());
    this.bookViews.clear();
    this.bgGraphics.destroy();
    super.destroy(fromScene);
  }
}
