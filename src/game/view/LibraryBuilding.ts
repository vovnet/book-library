import { Scene, GameObjects } from "phaser";

export class LibraryBuilding extends GameObjects.Container {
  public readonly levelId: number;
  public readonly isUnlocked: boolean;
  public readonly isCurrent: boolean;

  private baseSprite: GameObjects.Sprite;
  private highlight: GameObjects.Graphics;
  private levelLabel: GameObjects.Text;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    levelId: number,
    isUnlocked: boolean,
    isCurrent: boolean,
  ) {
    super(scene, x, y);
    this.levelId = levelId;
    this.isUnlocked = isUnlocked;
    this.isCurrent = isCurrent;

    // 1. Спрайт здания
    const textureKey = !isUnlocked
      ? "building-locked"
      : isCurrent
        ? "building-current"
        : "building-open";
    this.baseSprite = scene.add.sprite(0, 0, textureKey);
    this.add(this.baseSprite);

    // 2. Подсветка (изначально скрыта)
    this.highlight = scene.add.graphics();
    this.highlight.setVisible(false);
    this.add(this.highlight);

    // 3. Номер уровня
    this.levelLabel = scene.add
      .text(0, -this.baseSprite.height / 2 - 20, `${levelId}`, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: isUnlocked ? "#ffffff" : "#888888",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    this.add(this.levelLabel);

    if (isCurrent) {
      this.setSize(this.baseSprite.width, this.baseSprite.height);
      this.setInteractive({ useHandCursor: true });

      this.on("pointerover", () => {
        if (!this.isSelected) {
          this.scene.tweens.add({ targets: this, scale: 1.1, duration: 200, ease: "Back.out" });
        }
      });

      this.on("pointerout", () => {
        if (!this.isSelected) {
          this.scene.tweens.add({ targets: this, scale: 1, duration: 200, ease: "Back.out" });
        }
      });

      this.on("pointerdown", () => {
        scene.events.emit("building-selected", this);
      });
    } else {
      // Для пройденных или закрытых уровней курсор остается обычным
      this.disableInteractive();
    }

    scene.add.existing(this);
  }

  public setSelected(isSelected: boolean): void {
    if (isSelected) {
      this.scene.tweens.add({ targets: this, scale: 1.15, duration: 300, ease: "Back.out" });
      this.highlight.clear();
      this.highlight.lineStyle(4, 0xffd700, 1);
      const w = this.baseSprite.width;
      const h = this.baseSprite.height;
      this.highlight.strokeRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10);
      this.highlight.setVisible(true);
    } else {
      this.scene.tweens.add({ targets: this, scale: 1, duration: 300, ease: "Back.out" });
      this.highlight.setVisible(false);
    }
  }

  public get isSelected(): boolean {
    return this.highlight.visible;
  }
}
