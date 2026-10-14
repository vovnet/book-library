import { Book, Slot } from "./types";

export class Library {
  // Плоские хранилища для мгновенного доступа (O(1))
  public slots: Map<string, Slot> = new Map();
  public books: Map<string, Book> = new Map();

  // Состояния
  public floor: Book[] = [];
  public hand: Book[] = [];

  constructor(
    rows: number,
    bookcasesPerRow: number,
    shelvesPerBookcase: number,
    booksPerShelf: number,
  ) {
    let bookId = 0;

    // 1. Плоская генерация всех слотов и книг
    for (let r = 0; r < rows; r++) {
      for (let b = 0; b < bookcasesPerRow; b++) {
        for (let s = 0; s < shelvesPerBookcase; s++) {
          for (let i = 0; i < booksPerShelf; i++) {
            const slotId = `r${r}-b${b}-s${s}-slot${i}`;

            // Создаем книгу
            const book: Book = {
              id: `book-${bookId++}`,
              targetSlotId: slotId,
              location: "floor",
            };

            // Создаем слот (изначально пустой)
            const slot: Slot = {
              id: slotId,
              rowIndex: r,
              bookcaseIndex: b,
              shelfIndex: s,
              slotIndex: i,
              book: null,
            };

            this.slots.set(slotId, slot);
            this.books.set(book.id, book);
            this.floor.push(book);
          }
        }
      }
    }

    // 2. Перемешиваем книги на полу
    this.shuffle(this.floor);
  }

  // === ДЕЙСТВИЯ ИГРОКА ===

  public pickBookFromFloor(bookId: string): boolean {
    const book = this.books.get(bookId);
    if (!book || book.location !== "floor") return false;

    book.location = "hand";
    this.floor = this.floor.filter((b) => b.id !== bookId);
    this.hand.push(book);
    return true;
  }

  public placeBookToSlot(
    bookId: string,
    slotId: string,
  ): "success" | "wrong_slot" | "occupied" | "not_in_hand" {
    const book = this.books.get(bookId);
    if (!book || book.location !== "hand") return "not_in_hand";

    const slot = this.slots.get(slotId);
    if (!slot) return "wrong_slot";
    if (slot.book !== null) return "occupied";

    // ГЛАВНАЯ ПРОВЕРКА
    if (book.targetSlotId !== slotId) return "wrong_slot";

    // Успешное размещение
    book.location = "slot";
    slot.book = book;
    this.hand = this.hand.filter((b) => b.id !== bookId);

    return "success";
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ VIEW ===

  // Получить все слоты конкретного ряда (чтобы RowView мог их отрисовать)
  public getSlotsForRow(rowIndex: number): Slot[] {
    const result: Slot[] = [];
    this.slots.forEach((slot) => {
      if (slot.rowIndex === rowIndex) result.push(slot);
    });
    // Сортируем их по порядку, чтобы на полке они стояли слева направо
    return result.sort((a, b) => {
      if (a.bookcaseIndex !== b.bookcaseIndex) return a.bookcaseIndex - b.bookcaseIndex;
      if (a.shelfIndex !== b.shelfIndex) return a.shelfIndex - b.shelfIndex;
      return a.slotIndex - b.slotIndex;
    });
  }

  public isLevelComplete(): boolean {
    return this.hand.length === 0 && this.floor.length === 0;
  }

  private shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
