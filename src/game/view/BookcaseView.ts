import * as Phaser from "phaser";
import { SHELF_HEIGHT, ShelfView } from "./ShelfView";

export const SHELF_SPACING = 2;

export class BookcaseView extends Phaser.GameObjects.Container {
  public readonly bookcaseIndex: number;
  public readonly shelves: ShelfView[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bookcaseIndex: number,
    shelvesCount: number,
    slotsPerShelf: number,
  ) {
    super(scene, x, y);
    this.bookcaseIndex = bookcaseIndex;

    const shelfHeight = SHELF_HEIGHT;
    const shelfSpacing = SHELF_SPACING;
    const totalHeight = shelvesCount * shelfHeight + (shelvesCount - 1) * shelfSpacing;

    // Временный элемент для расчета ширины
    const tempShelf = new ShelfView(scene, 0, 0, 0, slotsPerShelf);
    const shelfWidth = tempShelf.width;
    tempShelf.destroy();

    const framePadding = 8;
    const frameWidth = shelfWidth + framePadding * 2;
    const frameHeight = totalHeight + framePadding * 2;

    // Каркас шкафа (задняя стенка и боковины)
    const frame = scene.add.graphics();
    frame.fillStyle(0x3e2b22, 1); // Темное дерево
    frame.fillRoundedRect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight, 8);
    frame.lineStyle(3, 0x2a1d17, 1);
    frame.strokeRoundedRect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight, 8);
    this.add(frame);

    // Размещаем полки внутри шкафа
    let currentY = -totalHeight / 2 + shelfHeight / 2;
    for (let i = 0; i < shelvesCount; i++) {
      const shelf = new ShelfView(scene, 0, currentY, i, slotsPerShelf);
      this.shelves.push(shelf);
      this.add(shelf);
      currentY += shelfHeight + shelfSpacing;
    }

    this.setSize(frameWidth, frameHeight);
  }

  public getShelfView(shelfIndex: number): ShelfView | undefined {
    return this.shelves[shelfIndex];
  }
}
