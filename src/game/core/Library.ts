import { Book, Bookcase, BookcaseRow, Shelf, ShelfSlot, Floor } from "./types";

export class Library {
  public rows: BookcaseRow[];
  public floors: Floor[] = [];
  public hand: Book[] = [];
  public slots: Map<string, ShelfSlot> = new Map();
  public books: Map<string, Book> = new Map();

  constructor(rows: number, bookcasesPerRow = 3, shelvesPerBookcase = 6, booksPerShelf = 9) {
    this.rows = [];
    let bookId = 0;

    // 1. Создаем полы (по одному на каждый ряд)
    for (let r = 0; r < rows; r++) {
      this.floors.push({
        id: `floor-${r}`,
        rowIndex: r,
        books: [],
      });
    }

    let currentFloorIndex = 0;

    // 2. Создаем структуру шкафов и распределяем книги
    for (let r = 0; r < rows; r++) {
      const bookcases: Bookcase[] = [];
      for (let b = 0; b < bookcasesPerRow; b++) {
        const shelves: Shelf[] = [];
        for (let s = 0; s < shelvesPerBookcase; s++) {
          const slots: ShelfSlot[] = [];
          for (let slot = 0; slot < booksPerShelf; slot++) {
            const slotId = `r${r}-b${b}-s${s}-slot${slot}`;

            const book: Book = {
              id: `book-${bookId++}`,
              targetSlotId: slotId,
              location: "floor",
            };

            const shelfSlot: ShelfSlot = {
              id: slotId,
              book: null,
              shelfIndex: s,
              bookcaseIndex: b,
              rowIndex: r,
              slotIndex: slot,
            };

            slots.push(shelfSlot);
            this.slots.set(slotId, shelfSlot);
            this.books.set(book.id, book);

            // <-- РАСПРЕДЕЛЯЕМ КНИГУ НА ТЕКУЩИЙ ПОЛ (по кругу)
            this.floors[currentFloorIndex].books.push(book);
            currentFloorIndex = (currentFloorIndex + 1) % rows;
          }
          shelves.push({
            id: `shelf-${r}-${b}-${s}`,
            books: slots.map((s) => s.book),
            isComplete: false,
          });
        }
        bookcases.push({ id: `bookcase-${r}-${b}`, shelves, isComplete: false });
      }
      this.rows.push({ id: `row-${r}`, bookcases, isComplete: false });
    }

    // 3. Перемешиваем книги на каждом полу отдельно
    this.floors.forEach((floor) => this.shuffleArray(floor.books));
  }

  get rowList() {
    return this.rows;
  }

  // Вспомогательный метод для UI: получить книги конкретного пола
  public getBooksOnFloor(rowIndex: number): Book[] {
    const floor = this.floors.find((f) => f.rowIndex === rowIndex);
    return floor ? floor.books : [];
  }

  // === ДЕЙСТВИЯ ИГРОКА ===

  public pickBookFromFloor(bookId: string): boolean {
    const book = this.books.get(bookId);
    if (!book || book.location !== "floor") return false;

    // Находим, на каком именно полу лежит эта книга
    const floor = this.floors.find((f) => f.books.some((b) => b.id === bookId));
    if (!floor) return false;

    book.location = "hand";
    floor.books = floor.books.filter((b) => b.id !== bookId);
    this.hand.push(book);
    return true;
  }

  public tryPlaceBook(
    bookId: string,
    slotId: string,
  ): "placed" | "wrong_slot" | "slot_occupied" | "not_in_hand" {
    const book = this.books.get(bookId);
    if (!book || book.location !== "hand") return "not_in_hand";

    const slot = this.slots.get(slotId);
    if (!slot) return "wrong_slot";
    if (slot.book !== null) return "slot_occupied";

    // ГЛАВНАЯ ПРОВЕРКА: тот ли это слот?
    if (book.targetSlotId !== slotId) return "wrong_slot";

    // Размещаем
    book.location = "slot";
    slot.book = book;
    this.hand = this.hand.filter((b) => b.id !== bookId);

    // Проверяем заполненность полки/шкафа/ряда
    this.checkCompletion(slot);

    return "placed";
  }

  // === ПРОВЕРКИ ===

  private checkCompletion(slot: ShelfSlot): void {
    const shelf = this.rows[slot.rowIndex].bookcases[slot.bookcaseIndex].shelves[slot.shelfIndex];

    const allSlotsOnShelf = this.getSlotsOnShelf(
      slot.rowIndex,
      slot.bookcaseIndex,
      slot.shelfIndex,
    );
    const isShelfFull = allSlotsOnShelf.every((s) => s.book !== null);

    if (isShelfFull) {
      shelf.isComplete = true;
      // Здесь можно добавить логику проверки isComplete для bookcase и row
    }
  }

  private getSlotsOnShelf(row: number, bookcase: number, shelf: number): ShelfSlot[] {
    const slots: ShelfSlot[] = [];
    const prefix = `r${row}-b${bookcase}-s${shelf}-`;
    this.slots.forEach((slot, id) => {
      if (id.startsWith(prefix)) slots.push(slot);
    });
    return slots;
  }

  // Универсальный метод перемешивания массива
  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  public isLevelComplete(): boolean {
    // Уровень пройден, если рука пуста И все полы пусты
    const allFloorsEmpty = this.floors.every((f) => f.books.length === 0);
    return this.hand.length === 0 && allFloorsEmpty;
  }
}
