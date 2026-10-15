import * as Phaser from "phaser";
import { Scene } from "phaser";
import { onEvent, offEvent } from "../core/EventBus";
import { Slot } from "../view/Slot";
import { Book } from "../view/Book";
import { Tooltip } from "../view/Tooltip";
import { HandManager } from "../core/HandManager";
import { ClickPickupStrategy, HoverPickupStrategy } from "../core/HandStrategies";
import { Shelf } from "../view/Shelf";

export class Game extends Scene {
  private handManager: HandManager;

  private slots: Slot[] = [];
  private books: Book[] = [];

  private shelves: Shelf[] = [];

  private tooltip: Tooltip;

  constructor() {
    super("Game");
  }

  create() {
    this.tooltip = new Tooltip(this);
    this.handManager = new HandManager(this, new HoverPickupStrategy(5));
    // 1. НАСТРОЙКИ ГЕНЕРАЦИИ
    const shelvesCount = 6;
    const slotsPerShelf = 9;
    const slotWidth = 18;
    const slotHeight = 32;
    const gapX = 1; // Расстояние между книгами на полке
    const gapY = 4; // Расстояние между полками

    const startX = 120; // Начальная позиция шкафа по X
    const startY = 80; // Начальная позиция шкафа по Y

    // Предварительный расчет размеров контура полки
    const padding = 0;
    const outlineWidth = slotsPerShelf * slotWidth + (slotsPerShelf - 1) * gapX + padding * 2;
    const outlineHeight = slotHeight + padding * 2;

    // 2. ГЕНЕРАЦИЯ СЛОТОВ И КНИГ
    for (let s = 0; s < shelvesCount; s++) {
      // 1. Создаем объект полки
      const outlineX = startX - 7;
      const outlineY = startY - 14 + s * (slotHeight + gapY);

      const shelf = new Shelf(this, outlineX, outlineY, outlineWidth, outlineHeight, s);
      this.shelves.push(shelf);

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
      const floorX = Phaser.Math.Between(50, 1200);
      const floorY = Phaser.Math.Between(500, 640);

      book.setPosition(floorX, floorY);
      book.setRotation(Phaser.Math.DegToRad(Phaser.Math.Between(-45, 45))); // Случайный наклон

      // Устанавливаем глубину, чтобы книги на полу были под книгами в руке
      book.setDepth(5);
      this.add.existing(book);
    });

    this.setupInputListeners();
  }

  private setupInputListeners() {
    if (this.handManager.getPickupMode() === "hover") {
      onEvent("book-hovered", this.handleBookPicked, this);
    } else {
      onEvent("book-picked-up", this.handleBookPicked, this);
    }

    onEvent("slot-clicked", this.handleSlotClicked, this);
    onEvent("shelf-clicked", this.handleShelfClicked, this);
  }

  private async handleShelfClicked(shelf: Shelf) {
    const booksInHand = this.handManager.getBooks();
    const matchingBook = booksInHand.find((b) => shelf.containsBook(b.id));

    if (!matchingBook) {
      return;
    }

    const targetSlot = this.slots.find((s) => s.id === matchingBook.id);
    if (targetSlot) {
      this.placeBookInSlot(matchingBook, targetSlot);
    }
  }

  private async handleBookPicked(book: Book) {
    const books = await this.handManager.addBook(book);
    if (books) {
      this.updateHighlights();
    }
  }

  private updateHighlightSlots() {
    const books = this.handManager.getBooks();
    this.slots.forEach((slot) => slot.setHighlight(false));
    books.forEach((b) => {
      this.slots.find((s) => s.id === b.id)?.setHighlight(true);
    });
  }

  private updateHighlightShelves() {
    const books = this.handManager.getBooks();
    this.shelves.forEach((shelf) => shelf.setHighlight(false));

    books.forEach((book) => {
      this.shelves.find((shelf) => shelf.containsBook(book.id))?.setHighlight(true);
    });
  }

  private async handleSlotClicked(slot: Slot) {
    const matchingBook = this.handManager.getBooks().find((b) => b.id === slot.id);

    if (!matchingBook) {
      this.tooltip.show(slot.x, slot.y, "Не та книга!", 2000);
      return;
    }

    this.placeBookInSlot(matchingBook, slot);
  }

  private async placeBookInSlot(book: Book, slot: Slot) {
    book.stopLevitation();
    await book.flyTo(slot.x, slot.y);

    this.handManager.removeBook(book);
    slot.setBook(book);

    this.updateHighlights();
  }

  private updateHighlights() {
    this.updateHighlightSlots();
    this.updateHighlightShelves();
  }

  shutdown() {
    offEvent("book-picked-up", this.handleBookPicked, this);
    offEvent("slot-clicked", this.handleSlotClicked, this);
    this.slots = [];
    this.books = [];
  }
}
