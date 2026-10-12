import * as Phaser from "phaser";
import { BookcaseView } from "./BookcaseView";
import { SlotView } from "./SlotView";

export class RowView extends Phaser.GameObjects.Container {
  public readonly rowIndex: number;
  public readonly bookcases: BookcaseView[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    rowIndex: number,
    bookcasesCount: number,
    shelvesPerBookcase: number,
    slotsPerShelf: number,
  ) {
    super(scene, x, y);
    this.rowIndex = rowIndex;

    // Создаем временный шкаф для замера ширины
    const tempBookcase = new BookcaseView(scene, 0, 0, 0, shelvesPerBookcase, slotsPerShelf);
    const bookcaseWidth = tempBookcase.width;
    const bookcaseHeight = tempBookcase.height;
    tempBookcase.destroy();

    const bookcaseSpacing = 10;
    const totalWidth = bookcasesCount * bookcaseWidth + (bookcasesCount - 1) * bookcaseSpacing;

    // Размещаем шкафы в ряд
    let currentX = -totalWidth / 2 + bookcaseWidth / 2;
    for (let i = 0; i < bookcasesCount; i++) {
      const bookcase = new BookcaseView(scene, currentX, 0, i, shelvesPerBookcase, slotsPerShelf);
      this.bookcases.push(bookcase);
      this.add(bookcase);
      currentX += bookcaseWidth + bookcaseSpacing;
    }

    this.setSize(totalWidth, bookcaseHeight);
  }

  public getBookcaseView(bookcaseIndex: number): BookcaseView | undefined {
    return this.bookcases[bookcaseIndex];
  }

  // Удобный метод для получения конкретного слота по полным координатам
  public getSlotView(
    bookcaseIndex: number,
    shelfIndex: number,
    slotIndex: number,
  ): SlotView | undefined {
    const bookcase = this.getBookcaseView(bookcaseIndex);
    if (!bookcase) return undefined;

    const shelf = bookcase.getShelfView(shelfIndex);
    if (!shelf) return undefined;

    return shelf.getSlotView(slotIndex);
  }
}
