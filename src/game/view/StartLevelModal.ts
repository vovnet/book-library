import { Scene, GameObjects, Geom } from "phaser";
import { GameState } from "../core/GameState";
import { BoosterId, boosters } from "../registers/boosters";
import { globalGame } from "../global/GlobalGame";

export class StartLevelModal extends GameObjects.Container {
  private gameState: GameState;
  // Храним выбор как Record<string, boolean>, а не жесткий тип
  private pendingSelections: Record<BoosterId, boolean> = {
    hand: false,
    hardIntuition: false,
    intuition: false,
    magnetto: false,
  };

  private toggleGraphics: Map<string, GameObjects.Graphics> = new Map();
  private onConfirm: (selections: Record<BoosterId, boolean>) => void;
  private onCancel: () => void;

  constructor(
    scene: Scene,
    onConfirm: (selections: Record<BoosterId, boolean>) => void,
    onCancel: () => void,
  ) {
    super(scene, scene.scale.width / 2, scene.scale.height / 2);

    this.gameState = globalGame.gameState;
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;

    this.buildUI();

    scene.add.existing(this);
    this.setDepth(1000);
    this.setScale(0.8).setAlpha(0);

    scene.tweens.add({ targets: this, scale: 1, alpha: 1, duration: 300, ease: "Back.out" });
  }

  private buildUI() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    const overlay = this.scene.add.rectangle(0, 0, w * 2, h * 2, 0x000000, 0.7).setInteractive();
    overlay.on("pointerdown", () => this.close());
    this.add(overlay);

    const modalWidth = 460;
    const modalHeight = 600;

    const modalBg = this.scene.add.nineslice(
      0,
      0,
      "ui",
      "modal",
      modalWidth,
      modalHeight,
      36,
      36,
      50,
      50,
    );

    modalBg.setInteractive(
      new Geom.Rectangle(0, 0, modalWidth, modalHeight),
      Geom.Rectangle.Contains,
    );

    this.add(modalBg);

    this.add(this.scene.add.image(0, -modalHeight / 2, "ui", "modal-head").setOrigin(0.5, 0));

    const closeBtn = this.scene.add
      .sprite(modalWidth / 2 - 20, -modalHeight / 2 + 20, "ui", "close-btn")
      .setInteractive()
      .once("pointerdown", () => this.close(), this);

    this.add(closeBtn);

    this.add(
      this.scene.add
        .text(0, -120, "Выберите бустеры", {
          fontFamily: "Arial",
          fontSize: "22px",
          color: "#ffd700",
          fontStyle: "bold",
        })
        .setOrigin(0.5),
    );

    let yOffset = -70;

    boosters.forEach((def) => {
      const count = this.gameState.getBoosterCount(def.id);
      const isAvailable = count > 0;

      // Инициализируем выбор как false
      this.pendingSelections[def.id] = false;

      const row = this.scene.add.container(0, yOffset);

      // Название и описание (можно сделать тултип)
      const nameText = this.scene.add.text(-150, -10, def.name, {
        fontSize: "18px",
        color: isAvailable ? "#ffffff" : "#666666",
        fontStyle: "bold",
      });
      const descText = this.scene.add.text(-150, 12, def.description || "", {
        fontSize: "14px",
        color: isAvailable ? "#aaaaaa" : "#555555",
      });
      row.add([nameText, descText]);

      // Количество
      row.add(this.scene.add.text(60, 0, `x${count}`, { fontSize: "18px", color: "#ffd700" }));

      // Тоггл
      const toggleBg = this.scene.add.graphics();
      this.toggleGraphics.set(def.id, toggleBg);
      row.add(toggleBg);

      const toggleZone = this.scene.add
        .rectangle(0, 0, 40, 30, 0x000000, 0)
        .setInteractive({ useHandCursor: isAvailable });

      if (isAvailable) {
        toggleZone.on("pointerdown", () => {
          this.pendingSelections[def.id] = !this.pendingSelections[def.id];
          if (def.id === "intuition" && this.pendingSelections[def.id]) {
            this.pendingSelections["hardIntuition"] = false;
            this.updateToggleVisual("hardIntuition");
          }
          if (def.id === "hardIntuition" && this.pendingSelections["intuition"]) {
            this.pendingSelections["intuition"] = false;
            this.updateToggleVisual("intuition");
          }
          this.updateToggleVisual(def.id);
        });
      }
      row.add(toggleZone);
      this.add(row);

      this.updateToggleVisual(def.id);
      yOffset += 60; // Чуть больше места для описания
    });

    // Кнопка старта
    const startContainer = this.scene.add.container(0, 210);
    const startBg = this.scene.add.graphics();
    startBg.fillStyle(0xffd700, 1).fillRoundedRect(-100, -20, 200, 40, 10);
    startContainer.add(startBg);

    const startText = this.scene.add
      .text(0, 0, "НАЧАТЬ УРОВЕНЬ", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    startContainer.add(startText);

    const startZone = this.scene.add
      .rectangle(0, 0, 200, 40, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    startZone.on("pointerdown", () => this.close(true));
    startContainer.add(startZone);

    this.add(startContainer);
  }

  private updateToggleVisual(id: BoosterId) {
    const gfx = this.toggleGraphics.get(id)!;
    gfx.clear();
    gfx.fillStyle(this.pendingSelections[id] ? 0x00ff00 : 0x444444, 1);
    gfx.fillRoundedRect(-20, -15, 40, 30, 5);
  }

  private close(confirmed: boolean = false) {
    console.log("close");
    this.scene.tweens.add({
      targets: this,
      scale: 0.8,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        this.destroy();
        if (confirmed) this.onConfirm(this.pendingSelections);
        else this.onCancel();
      },
    });
  }
}
