import * as Phaser from "phaser";
import { Slot } from "../core/types";
import { BookcaseView } from "./BookcaseView";
import {
  BOOKCASE_GAP,
  SHELF_HEIGHT,
  SHELF_GAP,
  SHELF_PADDING_X,
  SLOT_WIDTH,
  SLOT_GAP,
} from "../core/libConfig";

export class RowView extends Phaser.GameObjects.Container {
  public bookcases: BookcaseView[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, rowSlots: Slot[]) {
    super(scene, x, y);

    // 1. Группируем плоский список слотов по шкафам
    const bookcasesMap = new Map<number, Slot[]>();
    rowSlots.forEach((slot) => {
      if (!bookcasesMap.has(slot.bookcaseIndex)) bookcasesMap.set(slot.bookcaseIndex, []);
      bookcasesMap.get(slot.bookcaseIndex)!.push(slot);
    });

    // 2. Вычисляем ширину одного шкафа (чтобы правильно расставить их)
    const firstBookcaseSlots = bookcasesMap.get(0) || [];
    const shelvesCount = new Set(firstBookcaseSlots.map((s) => s.shelfIndex)).size;
    const slotsPerShelf = firstBookcaseSlots.length / shelvesCount;

    const singleBookcaseContentWidth = slotsPerShelf * SLOT_WIDTH + (slotsPerShelf - 1) * SLOT_GAP;
    const singleBookcaseWidth = singleBookcaseContentWidth + SHELF_PADDING_X * 2 + 16;

    // 3. Расставляем шкафы в ряд
    const bookcasesCount = bookcasesMap.size;
    const totalWidth = bookcasesCount * singleBookcaseWidth + (bookcasesCount - 1) * BOOKCASE_GAP;

    let currentX = -totalWidth / 2 + singleBookcaseWidth / 2;

    const sortedBookcaseIndexes = Array.from(bookcasesMap.keys()).sort((a, b) => a - b);

    sortedBookcaseIndexes.forEach((bcIndex) => {
      const bcSlots = bookcasesMap.get(bcIndex)!;
      const bookcaseView = new BookcaseView(scene, currentX, 0, bcSlots);
      this.bookcases.push(bookcaseView);
      this.add(bookcaseView);
      currentX += singleBookcaseWidth + BOOKCASE_GAP;
    });
  }
}
