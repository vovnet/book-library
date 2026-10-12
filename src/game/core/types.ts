export interface Book {
  id: string;
  targetSlotId: string;
  location: "slot" | "hand" | "floor";
}

export interface ShelfSlot {
  id: string;
  book: Book | null;
  shelfIndex: number;
  bookcaseIndex: number;
  rowIndex: number;
  slotIndex: number;
}

export interface Shelf {
  id: string;
  books: Array<Book | null>;
  isComplete: boolean;
}

export interface Bookcase {
  id: string;
  shelves: Shelf[];
  isComplete: boolean;
}

export interface BookcaseRow {
  id: string;
  bookcases: Bookcase[];
  isComplete: boolean;
}

export interface Floor {
  id: string;
  rowIndex: number;
  books: Book[];
}
