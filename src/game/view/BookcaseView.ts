import * as Phaser from "phaser";
import { Slot } from "../core/types";
import { ShelfView } from "./Shelf";
import { SHELF_HEIGHT, SHELF_GAP, SHELF_PADDING_X } from "../core/libConfig";
import { SLOT_WIDTH, SLOT_GAP } from "../core/libConfig";

export class BookcaseView extends Phaser.GameObjects.Container {
  public shelves: ShelfView[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, bookcaseSlots: Slot[]) {
    super(scene, x, y);

    // 1. Группируем слоты по полкам
    const shelvesMap = new Map<number, Slot[]>();
    bookcaseSlots.forEach((slot) => {
      if (!shelvesMap.has(slot.shelfIndex)) shelvesMap.set(slot.shelfIndex, []);
      shelvesMap.get(slot.shelfIndex)!.push(slot);
    });

    // 2. Вычисляем размеры каркаса (берем данные из первой полки)
    const firstShelfSlotsCount = bookcaseSlots.length / shelvesMap.size;
    const contentWidth = firstShelfSlotsCount * SLOT_WIDTH + (firstShelfSlotsCount - 1) * SLOT_GAP;
    const frameWidth = contentWidth + SHELF_PADDING_X * 2 + 16; // +16 на боковые стенки шкафа

    const shelvesCount = shelvesMap.size;
    const totalHeight = shelvesCount * SHELF_HEIGHT + (shelvesCount - 1) * SHELF_GAP;

    // 3. Рисуем заднюю стенку шкафа
    const backWall = scene.add.rectangle(0, 0, frameWidth, totalHeight + 16, 0x2a1d17);
    this.add(backWall);

    // 4. Создаем и расставляем полки по вертикали
    let currentY = -totalHeight / 2 + SHELF_HEIGHT / 2;

    // Сортируем индексы полок, чтобы полка 0 была сверху, а 5 снизу
    const sortedShelfIndexes = Array.from(shelvesMap.keys()).sort((a, b) => a - b);

    sortedShelfIndexes.forEach((shelfIndex) => {
      const shelfSlots = shelvesMap.get(shelfIndex)!;
      const shelfView = new ShelfView(scene, 0, currentY, shelfSlots);
      this.shelves.push(shelfView);
      this.add(shelfView);
      currentY += SHELF_HEIGHT + SHELF_GAP;
    });
  }
}
