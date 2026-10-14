import * as Phaser from "phaser";
import { BookcaseView } from "./BookcaseView";
import { BOOKCASE_GAP, SLOT_WIDTH } from "../core/libConfig";
import { BookcaseRow, ShelfSlot } from "../core/types";

export class RowView extends Phaser.GameObjects.Container {
  public rowData: BookcaseRow;
  public bookcases: BookcaseView[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    rowData: BookcaseRow,
    slotsMap: Map<string, ShelfSlot>,
  ) {
    super(scene, x, y);
    this.rowData = rowData;

    // Вычисляем ширину одного шкафа (берем данные из первого шкафа)
    const firstBookcase = rowData.bookcases[0];
    const firstShelfSlotsCount = firstBookcase.shelves[0].books.length;
    const singleBookcaseWidth =
      firstShelfSlotsCount * SLOT_WIDTH + (firstShelfSlotsCount - 1) * 1 + SLOT_WIDTH; // ширина + паддинги + рамка
    const singleBookcaseHeight =
      firstBookcase.shelves.length * 60 + (firstBookcase.shelves.length - 1) * 8; // SHELF_HEIGHT и GAP

    const totalWidth =
      rowData.bookcases.length * singleBookcaseWidth +
      (rowData.bookcases.length - 1) * BOOKCASE_GAP;

    // Размещаем шкафы
    let currentX = -totalWidth / 2 + singleBookcaseWidth / 2;
    const rowIndexNum = parseInt(rowData.id.split("-")[1], 10);

    rowData.bookcases.forEach((bookcaseData) => {
      const bookcaseView = new BookcaseView(
        scene,
        currentX,
        0,
        bookcaseData,
        rowIndexNum,
        slotsMap,
      );
      this.bookcases.push(bookcaseView);
      this.add(bookcaseView);
      currentX += singleBookcaseWidth + BOOKCASE_GAP;
    });

    this.setSize(totalWidth, singleBookcaseHeight);
  }

  // Удобный метод для поиска слота "извне"
  public getSlotView(
    bookcaseIndex: number,
    shelfIndex: number,
    slotIndex: number,
  ): Phaser.GameObjects.Container | undefined {
    const bc = this.bookcases[bookcaseIndex];
    if (!bc) return undefined;
    const shelf = bc.getShelfView(shelfIndex);
    if (!shelf) return undefined;
    const slot = shelf.getSlotView(slotIndex);
    return slot ? slot : undefined;
  }
}
