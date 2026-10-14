import { GameObjects } from "phaser";

export type Location = "floor" | "hand" | "slot";

export interface Book {
  id: string;
  targetSlotId: string; // Куда эта книга должна встать
  location: Location; // Где она сейчас
  view: GameObjects.Sprite;
}

export interface Slot {
  id: string; // Уникальный ID, например "r0-b1-s2-slot3"
  rowIndex: number; // Нужно только для того, чтобы View знала, где это рисовать
  bookcaseIndex: number;
  shelfIndex: number;
  slotIndex: number;
  book: Book | null; // Если null, слот пуст. Если есть объект, слот занят.
}
