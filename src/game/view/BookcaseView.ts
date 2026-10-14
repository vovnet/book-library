import * as Phaser from "phaser";
import { ShelfView } from "./ShelfView";
import { SHELF_GAP, SHELF_HEIGHT, SLOT_WIDTH } from "../core/libConfig";
import { Bookcase, ShelfSlot } from "../core/types";

export class BookcaseView extends Phaser.GameObjects.Container {
  public bookcaseData: Bookcase;
  public shelves: ShelfView[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bookcaseData: Bookcase,
    rowIndex: number,
    slotsMap: Map<string, ShelfSlot>,
  ) {
    super(scene, x, y);
    this.bookcaseData = bookcaseData;

    // Чтобы узнать ширину, смотрим на первую полку (все полки одинаковой ширины)
    const firstShelfSlotsCount = bookcaseData.shelves[0].books.length;
    const contentWidth = firstShelfSlotsCount * SLOT_WIDTH + (firstShelfSlotsCount - 1) * 2; // SLOT_WIDTH и GAP
    const frameWidth = contentWidth + 2; // SHELF_PADDING_X * 2
    const totalHeight =
      bookcaseData.shelves.length * SHELF_HEIGHT + (bookcaseData.shelves.length - 1) * SHELF_GAP;

    // 1. Рисуем каркас шкафа (задняя стенка)
    const frame = scene.add.graphics();
    frame.fillStyle(0x2a1d17, 1); // Темная рамка
    frame.fillRoundedRect(
      -frameWidth / 2 - 4,
      -totalHeight / 2 - 4,
      frameWidth + 8,
      totalHeight + 8,
      4,
    );
    frame.fillStyle(0x5c4033, 1); // Внутренняя часть
    frame.fillRoundedRect(-frameWidth / 2, -totalHeight / 2, frameWidth, totalHeight, 2);
    this.add(frame);

    // 2. Размещаем полки
    let currentY = -totalHeight / 2 + SHELF_HEIGHT / 2;
    const shelfIndexNum = parseInt(bookcaseData.id.split("-")[2], 10);

    bookcaseData.shelves.forEach((shelfData) => {
      const shelfView = new ShelfView(
        scene,
        0,
        currentY,
        shelfData,
        rowIndex,
        shelfIndexNum,
        slotsMap,
      );
      this.shelves.push(shelfView);
      this.add(shelfView);
      currentY += SHELF_HEIGHT + SHELF_GAP;
    });
  }

  public getShelfView(shelfIndex: number): ShelfView | undefined {
    return this.shelves[shelfIndex];
  }
}
