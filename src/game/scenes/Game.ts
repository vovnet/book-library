import * as Phaser from "phaser";
import { Scene } from "phaser";
import { onEvent, offEvent } from "../core/EventBus";
import { Slot } from "../view/Slot";
import { Book } from "../view/Book";
import { HandManager } from "../core/HandManager";
import { ClickPickupStrategy, HoverPickupStrategy } from "../core/HandStrategies";
import { Shelf } from "../view/Shelf";

export class Game extends Scene {
  private readonly CONFIG = {
    shelvesCount: 6,
    slotsPerShelf: 9,
    slotWidth: 18,
    slotHeight: 32,
    gapX: 1,
    gapY: 4,
    startX: 120,
    startY: 80,
  };

  private handManager: HandManager;

  private slots: Slot[] = [];
  private books: Book[] = [];

  private shelves: Shelf[] = [];

  constructor() {
    super("Game");
  }

  create() {
    this.handManager = new HandManager(this, new HoverPickupStrategy(5));
    // 1. НАСТРОЙКИ ГЕНЕРАЦИИ

    const { shelvesCount, slotsPerShelf, slotWidth, slotHeight, gapX, gapY, startX, startY } =
      this.CONFIG;

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
    const targetSlots = this.slots.filter((s) => shelf.containsId(s.id));
    this.attemptPlaceBook(targetSlots);
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
    this.attemptPlaceBook([slot]);
  }

  private async attemptPlaceBook(targetSlots: Slot[]) {
    const booksInHand = this.handManager.getBooks();
    // 1. Ищем книгу в руке, которая принадлежит ХОТЯ БЫ ОДНОМУ из целевых слотов
    const matchingBook = booksInHand.find((book) =>
      targetSlots.some((slot) => slot.id === book.id),
    );
    if (!matchingBook) {
      return;
    }
    // 2. Находим точный слот для этой книги
    const exactSlot = targetSlots.find((s) => s.id === matchingBook.id)!;
    // 3. Проверка на занятость (на случай рассинхронизации)
    if (exactSlot.book) {
      return;
    }
    // 4. Размещаем
    await this.placeBookInSlot(matchingBook, exactSlot);
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
