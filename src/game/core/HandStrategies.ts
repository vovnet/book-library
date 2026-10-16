import { Book } from "../view/Book";

export type PickupMode = "click" | "hover";

// 🌟 Стратегия возвращает массив позиций
export interface HandLayoutStrategy {
  readonly name: string;
  getMaxCapacity(): number;
  getPickupMode(): PickupMode;

  // Возвращает массив целей для каждой книги
  calculatePositions(
    booksCount: number,
    centerX: number,
    centerY: number,
  ): Array<{
    x: number;
    y: number;
    rotation: number;
    scale: number;
  }>;

  applyLevitation(book: Book): void;
  removeLevitation(book: Book): void;
}

export class ClickPickupStrategy implements HandLayoutStrategy {
  readonly name = "click";
  private maxCapacity: number;

  private slotWidth: number = 15; // Расстояние между книгами
  private startX: number = 0;

  constructor(maxCapacity: number = 1) {
    this.maxCapacity = maxCapacity;
  }

  getMaxCapacity(): number {
    return this.maxCapacity;
  }

  getPickupMode(): PickupMode {
    return "click";
  }

  // 🌟 Просто возвращаем данные
  calculatePositions(booksCount: number, centerX: number, centerY: number) {
    const positions: Array<{ x: number; y: number; rotation: number; scale: number }> = [];

    // Центрируем весь ряд книг относительно центра экрана
    const totalWidth = booksCount * this.slotWidth;
    const startX = centerX - totalWidth / 2 + this.slotWidth / 2;

    for (let index = 0; index < booksCount; index++) {
      positions.push({
        x: startX + index * this.slotWidth,
        y: centerY,
        rotation: 0,
        scale: 1.0,
      });
    }

    return positions;
  }

  applyLevitation(book: Book): void {
    book.startLevitation(4, 1400);
  }

  removeLevitation(book: Book): void {
    book.stopLevitation();
  }
}

export class HoverPickupStrategy implements HandLayoutStrategy {
  readonly name = "hover";
  private maxCapacity: number;

  private slotWidth: number = 15; // Расстояние между книгами
  private startX: number = 0;

  constructor(maxCapacity: number = 10) {
    this.maxCapacity = maxCapacity;
  }

  getMaxCapacity(): number {
    return this.maxCapacity;
  }

  getPickupMode(): PickupMode {
    return "hover";
  }

  calculatePositions(booksCount: number, centerX: number, centerY: number) {
    const positions: Array<{ x: number; y: number; rotation: number; scale: number }> = [];

    // Центрируем весь ряд книг относительно центра экрана
    const totalWidth = booksCount * this.slotWidth;
    const startX = centerX - totalWidth / 2 + this.slotWidth / 2;

    for (let index = 0; index < booksCount; index++) {
      positions.push({
        x: startX + index * this.slotWidth,
        y: centerY,
        rotation: 0,
        scale: 1.0,
      });
    }

    return positions;
  }

  applyLevitation(book: Book): void {
    book.startLevitation(6, 1000);
  }

  removeLevitation(book: Book): void {
    book.stopLevitation();
  }
}
