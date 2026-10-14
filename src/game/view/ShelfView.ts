import * as Phaser from "phaser";
import { SlotView } from "./SlotView";
import { SLOT_WIDTH, SLOT_GAP, SHELF_PADDING_X, SHELF_HEIGHT } from "../core/libConfig";
import { Shelf, ShelfSlot } from "../core/types";

export class ShelfView extends Phaser.GameObjects.Container {
  public shelfData: Shelf;
  public slots: SlotView[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    shelfData: Shelf,
    rowIndex: number,
    bookcaseIndex: number,
    slotsMap: Map<string, ShelfSlot>,
  ) {
    super(scene, x, y);
    this.shelfData = shelfData;

    const slotsCount = shelfData.books.length; // Это и есть booksPerShelf
    const contentWidth = slotsCount * SLOT_WIDTH + (slotsCount - 1) * SLOT_GAP;
    const frameWidth = contentWidth + SHELF_PADDING_X * 2;

    // 1. Рисуем саму полку (доску)
    const board = scene.add.rectangle(0, 0, frameWidth, SHELF_HEIGHT, 0x3e2b22);
    this.add(board);

    // 2. Создаем слоты внутри полки
    let currentX = -contentWidth / 2 + SLOT_WIDTH / 2;
    const shelfIndex = parseInt(shelfData.id.split("-")[3], 10); // Извлекаем 's' из id

    for (let i = 0; i < slotsCount; i++) {
      // Восстанавливаем ID слота точно так же, как он создан в Library
      const slotId = `r${rowIndex}-b${bookcaseIndex}-s${shelfIndex}-slot${i}`;
      const slotData = slotsMap.get(slotId)!;

      const slotView = new SlotView(scene, currentX, 0, slotData);
      this.slots.push(slotView);
      this.add(slotView);

      currentX += SLOT_WIDTH + SLOT_GAP;
    }
  }

  public getSlotView(slotIndex: number): SlotView | undefined {
    return this.slots[slotIndex];
  }
}
