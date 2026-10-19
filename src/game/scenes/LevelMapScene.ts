import * as Phaser from "phaser";
import { Scene } from "phaser";
import { BASE_POSITIONS, SEGMENT_WIDTH, VISIBLE_AHEAD, VISIBLE_BEHIND } from "../core/MapConfig";
import { LibraryBuilding } from "../view/LibraryBuilding";
import { GameState } from "../core/GameState";
import { globalGame } from "../global/GlobalGame";

export class LevelMapScene extends Scene {
  private gameState: GameState;
  private buildings: LibraryBuilding[] = [];
  private selectedBuilding: LibraryBuilding | null = null;
  private uiPanel: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: "LevelMap" });
  }

  create() {}

  init() {
    this.gameState = globalGame.gameState;
    console.log("init: ", this.gameState.level, this.registry.list);

    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;

    const minLevel = Math.max(1, this.gameState.level - VISIBLE_BEHIND);
    const maxLevel = this.gameState.level + VISIBLE_AHEAD;

    const lastBuildingPos = this.getWorldPosition(maxLevel);
    const worldWidth = lastBuildingPos.x + screenWidth;

    this.cameras.main.setBounds(0, 0, worldWidth, screenHeight);

    const mapBg = this.add.tileSprite(
      worldWidth / 2,
      screenHeight / 2,
      worldWidth,
      screenHeight,
      "map-texture",
    );
    mapBg.setDepth(-1);

    for (let level = minLevel; level <= maxLevel; level++) {
      const worldPos = this.getWorldPosition(level);
      const building = new LibraryBuilding(
        this,
        worldPos.x,
        worldPos.y,
        level,
        level <= this.gameState.level,
        level === this.gameState.level,
      );
      this.buildings.push(building);
    }

    this.events.on("building-selected", this.handleBuildingSelection, this);

    // При старте просто центрируем камеру, панель НЕ показываем
    const currentBuilding = this.buildings.find((b) => b.levelId === this.gameState.level);
    if (currentBuilding) {
      this.centerCameraOnBuilding(currentBuilding, false);
    }
  }

  private getWorldPosition(levelId: number): { x: number; y: number } {
    const segmentIndex = Math.floor((levelId - 1) / BASE_POSITIONS.length);
    const positionInSegment = (levelId - 1) % BASE_POSITIONS.length;
    const basePos = BASE_POSITIONS[positionInSegment];
    return { x: basePos.x + segmentIndex * SEGMENT_WIDTH, y: basePos.y };
  }

  // 🌟 МАКСИМАЛЬНО ПРОСТОЙ ОБРАБОТЧИК КЛИКА
  private handleBuildingSelection(building: LibraryBuilding) {
    if (!building.isCurrent) return;

    if (this.selectedBuilding === building && this.uiPanel) return;

    this.selectedBuilding = building;

    if (this.uiPanel) {
      this.uiPanel.destroy();
      this.uiPanel = null;
    }

    this.showUIPanel(building);

    this.centerCameraOnBuilding(building, true);
  }

  private centerCameraOnBuilding(building: LibraryBuilding, animate: boolean) {
    const screenWidth = this.scale.width;
    let targetScrollX = building.x - screenWidth / 2;

    const bounds = this.cameras.main.getBounds();
    const maxScrollX = Math.max(0, bounds.width - screenWidth);
    targetScrollX = Phaser.Math.Clamp(targetScrollX, 0, maxScrollX);

    const targetCenterX = targetScrollX + screenWidth / 2;

    if (animate) {
      this.cameras.main.pan(targetCenterX, this.cameras.main.centerY, 600, "Power2");
    } else {
      this.cameras.main.scrollX = targetScrollX;
    }
  }

  // 🌟 ПРОСТОЕ СОЗДАНИЕ ПАНЕЛИ
  private showUIPanel(building: LibraryBuilding) {
    // Дополнительная страховка от двойного вызова
    if (this.uiPanel) this.uiPanel.destroy();

    const w = this.scale.width;
    const h = this.scale.height;

    this.uiPanel = this.add.container(w / 2, h);
    this.uiPanel.setScrollFactor(0);
    this.uiPanel.setDepth(100);

    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 0.95);
    bg.fillRoundedRect(-180, -60, 360, 120, 20);
    bg.lineStyle(3, 0xffd700, 1);
    bg.strokeRoundedRect(-180, -60, 360, 120, 20);

    const title = this.add
      .text(0, -30, `Библиотека №${building.levelId}`, {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(0, 5, "Нажмите, чтобы начать", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.uiPanel.add([bg, title, subtitle]);

    this.tweens.add({ targets: this.uiPanel, y: h - 80, duration: 300, ease: "Back.out" });

    this.uiPanel.setInteractive(
      new Phaser.Geom.Rectangle(-180, -60, 360, 120),
      Phaser.Geom.Rectangle.Contains,
    );

    // 🛡️ .once гарантирует, что клик обработается ровно один раз
    this.uiPanel.once("pointerdown", () => {
      console.log(`🚀 Запуск уровня ${building.levelId}`);
      this.scene.start("Game");
    });
  }

  public advanceToNextLevel() {
    this.gameState.level++;
    this.scene.restart();
  }

  shutdown() {
    console.log("shotdown");
    this.events.off("building-selected", this.handleBuildingSelection, this);
  }
}
