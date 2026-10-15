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
    if (booksCount === 0) return positions;

    const radius = 80;
    const arcAngle = Math.PI / 4;
    const startAngle = Math.PI / 2 + arcAngle / 2;

    for (let index = 0; index < booksCount; index++) {
      const t = booksCount === 1 ? 0.5 : index / (booksCount - 1);
      const angle = startAngle - arcAngle * t;

      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius * 0.3,
        rotation: (t - 0.5) * 0.2,
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
    if (booksCount === 0) return positions;

    const radius = 120;
    const arcAngle = Math.PI / 2.5;
    const startAngle = Math.PI / 2 + arcAngle / 2;

    for (let index = 0; index < booksCount; index++) {
      const t = booksCount === 1 ? 0.5 : index / (booksCount - 1);
      const angle = startAngle - arcAngle * t;

      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius * 0.35,
        rotation: (t - 0.5) * 0.25,
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
