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
    bookcasesCount: 6,
    bookcaseGapX: 20,
    shelvesCount: 6,
    slotsPerShelf: 9,
    slotWidth: 18,
    slotHeight: 32,
    gapX: 1,
    gapY: 4,
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
      pickupStrategy: new HoverPickupStrategy(35),
      placementEventName: "shelf-clicked",
      resolveTargets: (shelf: Shelf) => this.slots.filter((s) => shelf.containsId(s.id)),
      // resolveTargets: (slot: Slot) => [slot],
      highlightMode: "shelves",
    };
  }

  create() {
    this.handManager = new HandManager(this, this.levelConfig.pickupStrategy);
    // 1. НАСТРОЙКИ ГЕНЕРАЦИИ

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
    // Общая ширина всех шкафов + все промежутки между ними
    const totalWidth = bookcasesCount * outlineWidth + (bookcasesCount - 1) * bookcaseGapX;

    // Получаем ширину игрового экрана и находим стартовую точку X
    const screenWidth = this.scale.width;
    const startX = (screenWidth - totalWidth) / 2;

    // 2. ГЕНЕРАЦИЯ ШКАФОВ, ПОЛОК И СЛОТОВ
    for (let b = 0; b < bookcasesCount; b++) {
      // Базовая X-координата для слотов текущего шкафа
      const currentStartX = startX + b * (outlineWidth + bookcaseGapX);

      for (let s = 0; s < shelvesCount; s++) {
        const outlineX = currentStartX - 7;
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
    // 1. Получаем целевые слоты (например, 9 слотов полки)
    const targetSlots = this.levelConfig.resolveTargets(source);
    if (!targetSlots || targetSlots.length === 0) return;

    const booksInHand = this.handManager.getBooks();

    // 2. 🌟 Ищем ВСЕ книги в руке, которые подходят к этим слотам (filter вместо find)
    const matchingBooks = booksInHand.filter((book) =>
      targetSlots.some((slot) => slot.id === book.id),
    );

    if (matchingBooks.length === 0) return; // Нет подходящих книг

    // 3. 🌟 Запускаем полет всех книг с эффектом "каскада" (волны)
    const promises = matchingBooks.map((book, index) => {
      const exactSlot = targetSlots.find((s) => s.id === book.id)!;
      if (exactSlot.book) return Promise.resolve(); // Слот уже занят, пропускаем

      // Добавляем задержку перед стартом полета (50мс * индекс книги)
      // Это создает красивый эффект, когда книги вылетают из руки одна за другой
      return new Promise<void>((resolve) => {
        this.time.delayedCall(index * 50, async () => {
          await this.placeBookInSlot(book, exactSlot);
          resolve();
        });
      });
    });

    // Ждем завершения полета ВСЕХ книг
    await Promise.all(promises);
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

    this.handManager.removeBook(book);
    slot.setBook(book);

    this.showFloatingText(slot.x, slot.y, "+1", "#feffc1");

    this.checkCompletions(slot);

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

  private checkCompletions(slot: Slot) {
    const b = slot.bookcaseIndex;
    const s = slot.shelfIndex;

    // 1. Проверяем ПОЛКУ
    const shelfSlots = this.slots.filter(
      (target) => target.bookcaseIndex === b && target.shelfIndex === s,
    );

    if (shelfSlots.every((target) => target.book !== null)) {
      console.log(`✅ Полка ${s} в шкафу ${b} полностью заполнена!`);
      // Визуальный фидбек: золотой текст над полкой
      this.showFloatingText(slot.x, slot.y - 20, "Полка готова!", "#ffd700");
    }

    // 2. Проверяем ШКАФ
    const bookcaseSlots = this.slots.filter((target) => target.bookcaseIndex === b);

    if (bookcaseSlots.every((target) => target.book !== null)) {
      console.log(`🏆 Шкаф ${b} полностью заполнен!`);
      // Визуальный фидбек: крупный зеленый текст
      this.showFloatingText(slot.x, slot.y - 40, "Шкаф заполнен!", "#00ff00");
    }
  }

  private showFloatingText(x: number, y: number, text: string, color: string = "#00ff00") {
    // Создаем текст чуть выше целевой точки
    const floatingText = this.add
      .text(x, y - 10, text, {
        fontSize: "26px",
        color: color,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3, // Обводка для читаемости на любом фоне
      })
      .setOrigin(0.5);

    // Поднимаем текст над всеми элементами полки и книги
    floatingText.setDepth(150);

    // Анимируем: движение вверх и исчезновение
    this.tweens.add({
      targets: floatingText,
      y: y - 40, // Конечная позиция Y (выше)
      alpha: 0, // Полная прозрачность в конце
      duration: 800, // Длительность анимации в мс
      ease: "Power2", // Плавное замедление
      onComplete: () => {
        floatingText.destroy(); // 🌟 КРИТИЧЕСКИ ВАЖНО: уничтожаем объект после анимации
      },
    });
  }

  shutdown() {
    offEvent("book-picked-up", this.handleBookPicked, this);
    offEvent("book-hovered", this.handleBookPicked, this);
    offEvent("shelf-clicked", this.handlePlacementAttempt, this);
    offEvent("slot-clicked", this.handlePlacementAttempt, this);

    this.handManager.clear();

    this.shelves.forEach((s) => s.destroy());
    this.slots.forEach((s) => s.destroy());
    this.books.forEach((b) => b.destroy());

    this.shelves = [];
    this.slots = [];
    this.books = [];
  }
}
