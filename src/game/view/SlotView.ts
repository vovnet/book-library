import * as Phaser from "phaser";

export const SLOT_WIDTH = 12;
export const SLOT_HEIGHT = 28;

export class SlotView extends Phaser.GameObjects.Container {
  public readonly slotIndex: number;
  private highlightGraphics: Phaser.GameObjects.Graphics;
  private baseGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, slotIndex: number) {
    super(scene, x, y);
    this.slotIndex = slotIndex;

    const slotWidth = SLOT_WIDTH;
    const slotHeight = SLOT_HEIGHT;

    // Базовый фон слота (полупрозрачный)
    this.baseGraphics = scene.add.graphics();
    this.baseGraphics.fillStyle(0xffffff, 0.1);
    this.baseGraphics.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 4);
    this.baseGraphics.lineStyle(1, 0x888888, 0.5);
    this.baseGraphics.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 4);
    this.add(this.baseGraphics);

    // Графика для подсветки (скрыта по умолчанию)
    this.highlightGraphics = scene.add.graphics();
    this.highlightGraphics.fillStyle(0x00ff00, 0.3);
    this.highlightGraphics.fillRoundedRect(
      -slotWidth / 2,
      -slotHeight / 2,
      slotWidth,
      slotHeight,
      4,
    );
    this.highlightGraphics.lineStyle(2, 0x00ff00, 1);
    this.highlightGraphics.strokeRoundedRect(
      -slotWidth / 2,
      -slotHeight / 2,
      slotWidth,
      slotHeight,
      4,
    );
    this.highlightGraphics.setVisible(false);
    this.add(this.highlightGraphics);

    this.setSize(slotWidth, slotHeight);
  }

  public setHighlight(isHighlighted: boolean): void {
    this.highlightGraphics.setVisible(isHighlighted);
  }

  public getBoundsRect(): Phaser.Geom.Rectangle {
    return this.getBounds();
  }
}
