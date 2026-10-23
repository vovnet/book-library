import { Scene } from "phaser";
import { GameState } from "../core/GameState";
import { BoosterId, boosters } from "../registers/boosters";
import { globalGame } from "../global/GlobalGame";
import { BaseModal } from "./ui/BaseModal";
import { Toggle } from "./ui/Toggle";

export class StartLevelModal extends BaseModal {
  private gameState: GameState;
  // Храним выбор как Record<string, boolean>, а не жесткий тип
  private pendingSelections: Record<BoosterId, boolean> = {
    hand: false,
    hardIntuition: false,
    intuition: false,
    magnetto: false,
  };

  private toggleGraphics: Map<string, Toggle> = new Map();
  private onConfirm: (selections: Record<BoosterId, boolean>) => void;
  private onCancel: () => void;

  constructor(
    scene: Scene,
    onConfirm: (selections: Record<BoosterId, boolean>) => void,
    onCancel: () => void,
  ) {
    super(scene, "УРОВЕНЬ", 460, 600);

    this.gameState = globalGame.gameState;
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;

    this.buildContent();
  }

  protected buildContent() {
    let yOffset = -70;

    const boostersText = this.scene.add
      .text(this.width / 2, yOffset - 100, "Выбери бустеры", {
        fontFamily: "Seym",
        fontSize: "24px",
        color: "#ffd700",
        stroke: "#363636",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add(boostersText);

    boosters.forEach((def) => {
      const count = this.gameState.getBoosterCount(def.id);
      const isAvailable = count > 0;

      // Инициализируем выбор как false
      this.pendingSelections[def.id] = false;

      const row = this.scene.add.container(0, yOffset);

      // Название и описание (можно сделать тултип)
      const nameText = this.scene.add
        .text(-180, -10, def.name, {
          fontFamily: "Seym",
          fontSize: "14px",
          color: isAvailable ? "#ececec" : "#acacac",
          wordWrap: { width: 100 },
          stroke: "#363636",
          strokeThickness: 4,
        })
        .setOrigin(0, 0.5);

      row.add([nameText]);

      // Количество
      row.add(
        this.scene.add.text(100, -20, `x${count}`, {
          fontFamily: "Seym",
          fontSize: "12px",
          color: "#777151",
        }),
      );

      // Тоггл
      const toggle = new Toggle(this.scene, {
        x: 40,
        y: -10,
        textureKey: "ui",
        frame: def.iconKey,
        disabled: !isAvailable,
      });
      this.toggleGraphics.set(def.id, toggle);
      row.add(toggle);

      if (isAvailable) {
        toggle.onChange((isOn) => {
          this.pendingSelections[def.id] = isOn;
          // 🌟 Если ВКЛЮЧИЛИ intuition -> программно ВЫКЛЮЧАЕМ hardIntuition
          if (def.id === "intuition" && isOn) {
            this.pendingSelections["hardIntuition"] = false;
            // false, false = выключить и НЕ вызывать onChange рекурсивно
            this.toggleGraphics.get("hardIntuition")?.setOn(false, false);
          }

          // 🌟 Если ВКЛЮЧИЛИ hardIntuition -> программно ВЫКЛЮЧАЕМ intuition
          if (def.id === "hardIntuition" && isOn) {
            this.pendingSelections["intuition"] = false;
            this.toggleGraphics.get("intuition")?.setOn(false, false);
          }
          this.updateToggleVisual(def.id);
        });
      }

      this.add(row);

      this.updateToggleVisual(def.id);
      yOffset += 80; // Чуть больше места для описания
    });

    // Кнопка старта
    const startContainer = this.scene.add.container(0, 250);
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
    const toggle = this.toggleGraphics.get(id)!;
    toggle.setOn(this.pendingSelections[id]);
  }

  public close(confirmed: boolean = false): void {
    this.playCloseAnimation(() => {
      if (confirmed) {
        this.onConfirm(this.pendingSelections);
      } else {
        this.onCancel();
      }
    });
  }
}
