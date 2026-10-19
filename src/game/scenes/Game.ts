import * as Phaser from "phaser";
import { Scene } from "phaser";
import { onEvent, offEvent } from "../core/EventBus";
import { Slot } from "../view/Slot";
import { Book } from "../view/Book";
import { HandManager } from "../core/HandManager";
import { ClickPickupStrategy, HoverPickupStrategy } from "../core/HandStrategies";
import { Shelf } from "../view/Shelf";
import { LevelConfig } from "../core/types";
import { LevelFeedbackManager } from "../core/LevelFeedbackManager";
import { Bookcase } from "../view/Bookcase";
import { LevelCompleteOverlay } from "../view/LevelCompleteOverlay";
import { GameState } from "../core/GameState";
import { globalGame } from "../global/GlobalGame";

export class Game extends Scene {
  private readonly CONFIG = {
    bookcasesCount: 5,
    bookcaseGapX: 76,
    shelvesCount: 6,
    slotsPerShelf: 9,
    slotWidth: 18,
    slotHeight: 32,
    gapX: 1,
    gapY: 8,
    startY: 80,
  };

  private levelConfig: LevelConfig;

  private handManager: HandManager;
  private feedback: LevelFeedbackManager;

  private slots: Slot[] = [];
  private books: Book[] = [];

  private shelves: Shelf[] = [];
  private bookcases: Bookcase[] = [];

  constructor() {
    super("Game");
  }

  init(data: { levelConfig?: LevelConfig }) {
    console.log("init game с данными:", data);
    Book.generateRandomPalette();

    this.levelConfig = data.levelConfig || {
      pickupStrategy: new HoverPickupStrategy(60),
      placementEventName: "bookcase-clicked",
      resolveTargets: (bc: Bookcase) => this.slots.filter((s) => bc.containsId(s.id)),
      // resolveTargets: (shelf: Shelf) => this.slots.filter((s) => shelf.containsId(s.id)),
      // resolveTargets: (slot: Slot) => [slot],
      highlightMode: "bookcases",
    };

    this.slots = [];
    this.books = [];
    this.shelves = [];
    this.bookcases = [];

    this.events.once("shutdown", this.shutdown, this);
  }

  create() {
    console.log("create game");
    this.handManager = new HandManager(this, this.levelConfig.pickupStrategy);
    this.feedback = new LevelFeedbackManager(this);

    const {
      bookcasesCount,
      bookcaseGapX,
      shelvesCount,
      slotsPerShelf,
      slotWidth,
      slotHeight,
      gapX,
      gapY,
      startY,
    } = this.CONFIG;

    const padding = 0;
    const outlineWidth = slotsPerShelf * slotWidth + (slotsPerShelf - 1) * gapX + padding * 2;
    const outlineHeight = slotHeight + padding * 2;

    // 🌟 1. ВЫЧИСЛЕНИЕ ЦЕНТРИРОВАНИЯ
    const totalWidth = bookcasesCount * outlineWidth + (bookcasesCount - 1) * bookcaseGapX;
    const screenWidth = this.scale.width;
    const startX = (screenWidth - totalWidth) / 2;

    // Вычисляем центр по Y для всего блока полок (он одинаков для всех шкафов)
    const totalShelvesHeight = shelvesCount * (slotHeight + gapY);
    const centerShelvesY = startY - 14 + totalShelvesHeight / 2;

    const bookcaseVisualWidth = outlineWidth; // компенсация outlineX - 7
    const bookcaseVisualHeight = totalShelvesHeight;

    // 2. ГЕНЕРАЦИЯ ШКАФОВ, ПОЛОК И СЛОТОВ
    for (let b = 0; b < bookcasesCount; b++) {
      const currentStartX = startX + b * (outlineWidth + bookcaseGapX);
      const outlineX = currentStartX - 7;
      const outlineY = startY - 14;

      // 🌟 2.1 ДОБАВЛЯЕМ ИЗОБРАЖЕНИЕ ШКАФА "КАК ЕСТЬ"
      // Находим центр текущей зоны слотов по X
      const bookcaseCenterX = currentStartX + outlineWidth / 2;

      const bookcaseBg = this.add.image(bookcaseCenterX, centerShelvesY, "bookcase");
      bookcaseBg.x -= 7;
      bookcaseBg.y -= 10;
      bookcaseBg.setDepth(0); // 🌟 Убираем на самый задний план

      const bookcase = new Bookcase(
        this,
        outlineX,
        outlineY,
        bookcaseVisualWidth,
        bookcaseVisualHeight,
        b,
        bookcaseBg,
      );
      this.bookcases.push(bookcase);

      for (let s = 0; s < shelvesCount; s++) {
        const outlineY = startY - 14 + s * (slotHeight + gapY);

        const shelf = new Shelf(this, outlineX, outlineY, outlineWidth, outlineHeight, b, s);
        this.shelves.push(shelf);

        for (let i = 0; i < slotsPerShelf; i++) {
          const itemId = `r0-b${b}-sh${s}-sl${i}`;
          const slotX = currentStartX + 2 + i * (slotWidth + gapX);
          const slotY = startY + 2 + s * (slotHeight + gapY);

          const slot = new Slot(this, slotX, slotY, itemId, b, s);
          this.add.existing(slot);
          this.slots.push(slot);

          const book = new Book(this, 0, 0, itemId);
          this.books.push(book);
        }
      }
    }

    // 3. РАЗБРАСЫВАЕМ КНИГИ ПО ПОЛУ
    this.books.forEach((book) => {
      const floorX = Phaser.Math.Between(50, screenWidth - 50);
      const floorY = Phaser.Math.Between(500, 640);

      book.setPosition(floorX, floorY);
      book.setRotation(Phaser.Math.DegToRad(Phaser.Math.Between(-45, 45)));
      book.setDepth(5); // Книги на полу выше фона (0), но ниже руки (100+)
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
    const targetSlots = this.levelConfig.resolveTargets(source);
    if (!targetSlots || targetSlots.length === 0) return;

    const booksInHand = this.handManager.getBooks();
    const matchingBooks = booksInHand.filter((book) =>
      targetSlots.some((slot) => slot.id === book.id),
    );

    if (matchingBooks.length === 0) return;

    // 🌟 1. МГНОВЕННОЕ ОБНОВЛЕНИЕ СОСТОЯНИЯ
    // Удаляем книги из менеджера СРАЗУ, до начала любых анимаций
    matchingBooks.forEach((book) => {
      this.handManager.removeBook(book);
    });

    // 🌟 2. МГНОВЕННОЕ ОТКЛЮЧЕНИЕ ПОДСВЕТКИ (и кликабельности)
    this.updateHighlights();

    // 🌟 3. Запускаем визуальные анимации для книг, которые мы только что "забрали"
    const promises = matchingBooks.map((book, index) => {
      const exactSlot = targetSlots.find((s) => s.id === book.id)!;
      if (exactSlot.book) return Promise.resolve();

      return new Promise<void>((resolve) => {
        this.time.delayedCall(index * 50, async () => {
          await this.placeBookInSlot(book, exactSlot);
          resolve();
        });
      });
    });

    await Promise.all(promises);

    this.checkLevelCompletion();
  }

  private async checkLevelCompletion() {
    const isLevelCompleted = !this.books.some((b) => b.location !== "slot");

    if (isLevelCompleted) {
      const overflow = new LevelCompleteOverlay(this, () => {
        const { gameState, saveManager } = globalGame;
        gameState.level++;
        console.log("close: ", gameState.level);
        saveManager.save();
        this.scene.start("MainScene");
      });
      await this.delay(2000);
      overflow.show();
    }
  }

  private async handleBookPicked(book: Book) {
    const books = await this.handManager.addBook(book);
    if (books) {
      this.updateHighlights();
    }
  }

  private async placeBookInSlot(book: Book, slot: Slot) {
    book.stopLevitation();

    await book.flyTo(slot.x, slot.y);
    book.setLocation("slot");

    // Книга уже удалена из руки в handlePlacementAttempt!
    slot.setBook(book);

    this.feedback.showFloatingText(slot.x, slot.y, "+1", "#feffc1");
    this.checkCompletions(slot);
  }

  private updateHighlights() {
    const booksInHand = this.handManager.getBooks();
    const mode = this.levelConfig.highlightMode;

    // 1. Сначала сбрасываем ВСЁ, чтобы не было "залипаний"
    this.slots.forEach((s) => s.setHighlight(false));
    this.shelves.forEach((s) => s.setHighlight(false));
    this.bookcases.forEach((bc) => bc.setHighlight(false));

    // 2. Включаем подсветку только для нужного режима
    booksInHand.forEach((book) => {
      if (mode === "slots") {
        this.slots.find((s) => s.id === book.id)?.setHighlight(true);
      }

      if (mode === "shelves") {
        this.shelves.find((s) => s.containsId(book.id))?.setHighlight(true);
      }

      if (mode === "bookcases") {
        this.bookcases.find((bc) => bc.containsId(book.id))?.setHighlight(true);
      }
    });
  }

  private triggerBookcaseShine(bookcaseIndex: number): void {
    const bookcase = this.bookcases.find((bc) => bc.bookcaseIndex === bookcaseIndex);

    if (bookcase) {
      bookcase.shine();
    }
  }

  // 🌟 Утилита для паузы (чтобы не использовать setTimeout напрямую)
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }

  private async checkCompletions(slot: Slot) {
    const b = slot.bookcaseIndex;
    const s = slot.shelfIndex;

    // 1. Проверяем ПОЛКУ
    const shelfSlots = this.slots
      .filter((target) => target.bookcaseIndex === b && target.shelfIndex === s)
      .sort((a, b) => a.id.localeCompare(b.id));

    const isShelfFull = shelfSlots.every((target) => target.book !== null);

    // 2. Проверяем ШКАФ
    const bookcaseSlots = this.slots.filter((target) => target.bookcaseIndex === b);
    const isBookcaseFull = bookcaseSlots.every((target) => target.book !== null);

    if (isShelfFull) {
      // 🌟 ЖДЕМ завершения анимации всей полки!
      await this.feedback.animateShelfCompletion(shelfSlots);

      // Если этот ход заполнил и весь шкаф, запускаем его анимацию ПОСЛЕ полки
      if (isBookcaseFull) {
        await this.delay(200);
        this.feedback.triggerBookcaseAnimation(b, bookcaseSlots);
        this.triggerBookcaseShine(b);
      }
    }
  }

  shutdown() {
    console.log("shutdown");
    offEvent("book-picked-up", this.handleBookPicked, this);
    offEvent("book-hovered", this.handleBookPicked, this);
    offEvent("shelf-clicked", this.handlePlacementAttempt, this);
    offEvent("slot-clicked", this.handlePlacementAttempt, this);
    offEvent("bookcase-clicked", this.handlePlacementAttempt, this);

    this.handManager.clear();

    this.bookcases.forEach((bc) => bc.destroy()); // 🌟 ОЧИСТКА
    this.shelves.forEach((s) => s.destroy());
    this.slots.forEach((s) => s.destroy());
    this.books.forEach((b) => b.destroy());

    this.bookcases = [];
    this.shelves = [];
    this.slots = [];
    this.books = [];
  }
}
