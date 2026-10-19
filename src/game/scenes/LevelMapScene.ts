import * as Phaser from "phaser";
import { Scene } from "phaser";
import { BASE_POSITIONS, SEGMENT_WIDTH, VISIBLE_AHEAD, VISIBLE_BEHIND } from "../core/MapConfig";
import { LibraryBuilding } from "../view/LibraryBuilding";
import { GameState } from "../core/GameState";
import { globalGame } from "../global/GlobalGame";
import { LevelConfigBuilder } from "../core/LevelConfigBuilder";
import { BoosterId } from "../registers/boosters";
import { StartLevelModal } from "../view/StartLevelModal";
import { UIScene } from "./UIScene";

export class LevelMapScene extends Scene {
  private gameState: GameState;
  private buildings: LibraryBuilding[] = [];
  private selectedBuilding: LibraryBuilding | null = null;

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

    if (this.selectedBuilding === building) return;

    this.selectedBuilding = building;

    this.centerCameraOnBuilding(building, true);

    const uiScene = this.scene.get("UIScene") as UIScene;
    new StartLevelModal(
      uiScene,
      (selections) => this.confirmStartLevel(building, selections),
      () => console.log("cancel"),
    );
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

  public advanceToNextLevel() {
    this.gameState.level++;
    this.scene.restart();
  }

  private confirmStartLevel(building: LibraryBuilding, selections: Record<BoosterId, boolean>) {
    const builder = new LevelConfigBuilder();
    builder.withSlotHighlight();
    builder.withClickPickup();

    const activeBoosters = Object.keys(selections).filter((key) => selections[key]) as BoosterId[];
    console.log({ activeBoosters });
    activeBoosters.forEach((boosterId) => {
      this.gameState.useBooster(boosterId);

      switch (boosterId) {
        case "hand":
          const baseHandSize = Math.max(this.gameState.handSize, 5);
          console.log({ baseHandSize });
          builder.withMaxBooks(baseHandSize * 2);
          break;
        case "magnetto":
          builder.withHoverPickup();
          break;
        case "intuition":
          builder.withShelfHighlight();
          break;
        case "hardIntuition":
          builder.withBookcaseHighlight();
          break;
      }
    });

    const finalLevelConfig = builder.build();

    this.scene.start("Game", {
      levelConfig: finalLevelConfig,
      levelNumber: building.levelId,
    });
  }

  shutdown() {
    console.log("shotdown");
    this.events.off("building-selected", this.handleBuildingSelection, this);
  }
}
