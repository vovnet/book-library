import * as Phaser from "phaser";
import { Scene } from "phaser";
import { onEvent, offEvent } from "../core/EventBus";
import { Slot } from "../view/Slot";
import { Book } from "../view/Book";
import { HandManager } from "../core/HandManager";
import { ClickPickupStrategy, HoverPickupStrategy } from "../core/HandStrategies";
import { Shelf } from "../view/Shelf";
import { LevelConfig } from "../core/types";

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

  private levelConfig: LevelConfig;

  private handManager: HandManager;

  private slots: Slot[] = [];
  private books: Book[] = [];

  private shelves: Shelf[] = [];

  constructor(config?: { levelConfig: LevelConfig }) {
    super("Game");

    this.levelConfig = config?.levelConfig || {
      pickupStrategy: new HoverPickupStrategy(5),
      placementEventName: "shelf-clicked",
      resolveTargets: (shelf: Shelf) => this.slots.filter((s) => shelf.containsId(s.id)),
      // resolveTargets: (slot: Slot) => [slot],
      highlightMode: "shelves",
    };
  }

  create() {
    this.handManager = new HandManager(this, this.levelConfig.pickupStrategy);
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
    const mode = this.handManager.getPickupMode();
    const pickupEvent = mode === "hover" ? "book-hovered" : "book-picked-up";
    onEvent(pickupEvent, this.handleBookPicked, this);

    // 🌟 Подписка на размещение ТОЛЬКО для текущего режима уровня
    onEvent(this.levelConfig.placementEventName, this.handlePlacementAttempt, this);
  }

  private async handlePlacementAttempt(source: any) {
    // 1. Спрашиваем у конфига, какие слоты целевые для этого источника
    const targetSlots = this.levelConfig.resolveTargets(source);
    if (!targetSlots || targetSlots.length === 0) return;

    const booksInHand = this.handManager.getBooks();

    // 2. Ищем книгу в руке, которая совпадает с одним из целевых слотов
    const matchingBook = booksInHand.find((book) =>
      targetSlots.some((slot) => slot.id === book.id),
    );

    if (!matchingBook) return; // Нет подходящей книги

    // 3. Находим точный слот
    const exactSlot = targetSlots.find((s) => s.id === matchingBook.id)!;
    if (exactSlot.book) return; // Слот уже занят (защита)

    // 4. Размещаем
    await this.placeBookInSlot(matchingBook, exactSlot);
  }

  private async handleBookPicked(book: Book) {
    const books = await this.handManager.addBook(book);
    if (books) {
      this.updateHighlights();
    }
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
    const booksInHand = this.handManager.getBooks();
    const mode = this.levelConfig.highlightMode;

    // 1. Сначала сбрасываем ВСЁ, чтобы не было "залипаний"
    this.slots.forEach((s) => s.setHighlight(false));
    this.shelves.forEach((s) => s.setHighlight(false));

    // 2. Включаем подсветку только для нужного режима
    booksInHand.forEach((book) => {
      if (mode === "slots") {
        this.slots.find((s) => s.id === book.id)?.setHighlight(true);
      }

      if (mode === "shelves") {
        this.shelves.find((s) => s.containsId(book.id))?.setHighlight(true);
      }
    });
  }

  shutdown() {
    offEvent("book-picked-up", this.handleBookPicked, this);
    offEvent("slot-clicked", this.handleSlotClicked, this);
    this.slots = [];
    this.books = [];
  }
}
