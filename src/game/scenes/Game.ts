import * as Phaser from "phaser";
import { Scene } from "phaser";
import { onEvent, offEvent } from "../core/EventBus";
import { Slot } from "../view/Slot";
import { Book } from "../view/Book";
import { Tooltip } from "../view/Tooltip";

export class Game extends Scene {
  private hand: Book[] = [];
  private slots: Slot[] = [];
  private books: Book[] = [];

  private tooltip: Tooltip;

  constructor() {
    super("Game");
  }

  create() {
    this.tooltip = new Tooltip(this);
    // 1. НАСТРОЙКИ ГЕНЕРАЦИИ
    const shelvesCount = 6;
    const slotsPerShelf = 9;
    const slotWidth = 18;
    const slotHeight = 32;
    const gapX = 1; // Расстояние между книгами на полке
    const gapY = 4; // Расстояние между полками

    const startX = 120; // Начальная позиция шкафа по X
    const startY = 80; // Начальная позиция шкафа по Y

    // 🌟 ЗДЕСЬ ПОТОМ ПОДСТАВИШЬ СПРАЙТ ШКАФА:
    // const bookcaseSprite = this.add.image(startX + 80, startY + 100, 'bookcase_texture');
    // bookcaseSprite.setDepth(1); // Чтобы был позади книг, но поверх фона сцены

    // 2. ГЕНЕРАЦИЯ СЛОТОВ И КНИГ
    for (let s = 0; s < shelvesCount; s++) {
      for (let i = 0; i < slotsPerShelf; i++) {
        // Формируем уникальный ID, который будет одинаковым у слота и книги
        const itemId = `r0-b0-sh${s}-sl${i}`;

        // Вычисляем координаты слота на полке
        const slotX = startX + 2 + i * (slotWidth + gapX);
        const slotY = startY + 2 + s * (slotHeight + gapY);

        // Создаем слот и добавляем в сцену и в наш массив
        const slot = new Slot(this, slotX, slotY, itemId);
        this.add.existing(slot);
        this.slots.push(slot);

        // Создаем книгу с тем же ID
        const book = new Book(this, 0, 0, itemId);
        this.books.push(book);
      }
    }

    // 3. РАЗБРАСЫВАЕМ КНИГИ ПО ПОЛУ
    this.books.forEach((book) => {
      // Случайная позиция в нижней части экрана (зона "пола")
      const floorX = Phaser.Math.Between(50, 750);
      const floorY = Phaser.Math.Between(500, 580);

      book.setPosition(floorX, floorY);
      book.setRotation(Phaser.Math.DegToRad(Phaser.Math.Between(-45, 45))); // Случайный наклон

      // Устанавливаем глубину, чтобы книги на полу были под книгами в руке
      book.setDepth(5);
      this.add.existing(book);
    });

    // 4. ПОДПИСЫВАЕМСЯ НА СОБЫТИЯ
    onEvent("book-picked-up", this.handleBookPickedUp, this);
    onEvent("slot-clicked", this.handleSlotClicked, this);
  }

  // 🌟 ОБРАБОТКА ВЗЯТИЯ КНИГИ С ПОЛА
  private handleBookPickedUp(book: Book) {
    // Добавляем в руку
    this.hand.push(book);

    // Анимация полета в "зону руки" (центр экрана)
    book.flyTo(this.cameras.main.centerX, this.cameras.main.centerY).then(() => {
      book.setDepth(100); // Книга в руке всегда поверх всего
    });
  }

  // 🌟 ОБРАБОТКА КЛИКА ПО СЛОТУ
  private handleSlotClicked(slot: Slot) {
    // Ищем в руке книгу, чей ID совпадает с ID слота
    const matchingBook = this.hand.find((b) => b.id === slot.id);

    if (!matchingBook) {
      slot.setHighlight(true);
      this.tooltip.show(slot.x, slot.y, "aaaaa");
      return;
    }

    // 1. Анимируем полет книги в слот
    matchingBook.flyTo(slot.x, slot.y).then(() => {
      // 2. Выравниваем координаты и отключаем интерактивность
      matchingBook.setPosition(slot.x, slot.y);
      matchingBook.setRotation(0);
      matchingBook.disableInteractive();
      matchingBook.setDepth(10);

      // 3. Обновляем визуал слота
      slot.setBook(matchingBook);

      // 4. Удаляем книгу из руки
      this.hand = this.hand.filter((b) => b.id !== matchingBook.id);

      // 5. Проверяем победу
      if (this.hand.length === 0) {
        console.log("🎉 ПОЗДРАВЛЯЮ! ВСЕ КНИГИ НА МЕСТАХ! 🎉");
      }
    });
  }

  // 🌟 ОЧИСТКА ПРИ ПЕРЕЗАПУСКЕ СЦЕНЫ
  shutdown() {
    offEvent("book-picked-up", this.handleBookPickedUp, this);
    offEvent("slot-clicked", this.handleSlotClicked, this);
    this.hand = [];
    this.slots = [];
    this.books = [];
  }
}
