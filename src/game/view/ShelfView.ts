import * as Phaser from "phaser";
import { Slot } from "../core/types";
import { SlotView } from "./Slot";
import { SLOT_WIDTH, SLOT_GAP, SHELF_PADDING_X, SHELF_HEIGHT } from "../core/libConfig";

export class ShelfView extends Phaser.GameObjects.Container {
  public slots: SlotView[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, shelfSlots: Slot[]) {
    super(scene, x, y);

    // 1. Вычисляем размеры
    const slotsCount = shelfSlots.length;
    const contentWidth = slotsCount * SLOT_WIDTH + (slotsCount - 1) * SLOT_GAP;
    const boardWidth = contentWidth + SHELF_PADDING_X * 2;

    // 2. Рисуем "доску" полки
    const board = scene.add.rectangle(0, 0, boardWidth, SHELF_HEIGHT, 0x5c4033);
    this.add(board);

    // 3. Расставляем слоты
    let currentX = -contentWidth / 2 + SLOT_WIDTH / 2;

    shelfSlots.forEach((slotData) => {
      const slotView = new SlotView(scene, currentX, 0, slotData);
      this.slots.push(slotView);
      this.add(slotView);
      currentX += SLOT_WIDTH + SLOT_GAP;
    });
  }
}
