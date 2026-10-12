import * as Phaser from "phaser";
import { SLOT_WIDTH, SlotView } from "./SlotView";

export const SHELF_HEIGHT = 40;
export const SLOT_SPACING = 4;

export class ShelfView extends Phaser.GameObjects.Container {
  public readonly shelfIndex: number;
  public readonly slots: SlotView[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, shelfIndex: number, slotsCount: number) {
    super(scene, x, y);
    this.shelfIndex = shelfIndex;

    const slotWidth = SLOT_WIDTH;
    const slotSpacing = SLOT_SPACING;
    const shelfWidth = slotsCount * slotWidth + (slotsCount - 1) * slotSpacing;
    const shelfHeight = SHELF_HEIGHT;

    // Доска полки
    const board = scene.add.graphics();
    board.fillStyle(0x5c4033, 1); // Коричневый цвет дерева
    board.fillRoundedRect(-shelfWidth / 2, -shelfHeight / 2, shelfWidth, shelfHeight, 6);
    board.lineStyle(2, 0x3e2b22, 1);
    board.strokeRoundedRect(-shelfWidth / 2, -shelfHeight / 2, shelfWidth, shelfHeight, 6);
    this.add(board);

    // Создаем слоты
    let currentX = -shelfWidth / 2 + slotWidth / 2;
    for (let i = 0; i < slotsCount; i++) {
      const slot = new SlotView(scene, currentX, 0, i);
      this.slots.push(slot);
      this.add(slot);
      currentX += slotWidth + slotSpacing;
    }

    this.setSize(shelfWidth, shelfHeight);
  }

  public getSlotView(slotIndex: number): SlotView | undefined {
    return this.slots[slotIndex];
  }
}
