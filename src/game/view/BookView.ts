import * as Phaser from "phaser";
import { Book } from "../core/types";

export interface BookViewConfig {
  model: Book;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  symbol: string;
  onClick?: (model: BookView) => void; // <-- 1. Добавляем коллбэк в конфиг
}

export class BookView extends Phaser.GameObjects.Container {
  public model: Book;

  private bg: Phaser.GameObjects.Graphics;
  private symbolText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: BookViewConfig) {
    super(scene, config.x, config.y);

    this.model = config.model;

    // Фон книги
    this.bg = scene.add.graphics();
    this.bg.fillStyle(config.color, 1);
    this.bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 4);
    this.bg.lineStyle(2, 0x000000, 1);
    this.bg.strokeRoundedRect(
      -config.width / 2,
      -config.height / 2,
      config.width,
      config.height,
      4,
    );
    this.add(this.bg);

    // Символ на книге
    this.symbolText = scene.add
      .text(0, 0, config.symbol, {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add(this.symbolText);

    // Задаем размер контейнера для корректной работы hit-area (зоны клика)
    this.setSize(config.width, config.height);

    // <-- 2. Делаем контейнер интерактивным
    this.setInteractive();

    // <-- 3. Вешаем обработчик клика
    this.once("pointerdown", () => {
      if (config.onClick) {
        config.onClick(this);
      }
    });

    // <-- 4. (Бонус) UX: меняем курсор и подсвечиваем книгу при наведении
    this.on("pointerover", () => {
      this.scene.input.setDefaultCursor("pointer"); // Курсор-рука
      this.setHighlight(true);
    });

    this.on("pointerout", () => {
      this.scene.input.setDefaultCursor("default"); // Обычный курсор
      this.setHighlight(false);
    });
  }

  public async flyTo(worldX: number, worldY: number, duration: number = 0) {
    let targetX = worldX;
    let targetY = worldY;

    // Если у объекта есть родительский контейнер, трансформируем мировые координаты в локальные
    if (this.parentContainer) {
      const localPoint = new Phaser.Math.Vector2();

      // Метод берет мировые координаты и трансформирует их с учетом матрицы родителя
      this.parentContainer.getLocalPoint(worldX, worldY, localPoint);

      targetX = localPoint.x;
      targetY = localPoint.y;
    }

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        x: targetX,
        y: targetY,
        duration,
        ease: "Back.easeInOut",
        onComplete: () => {
          this.setAngle(0);
          resolve(true);
        },
      });
    });
  }

  public setHighlight(enabled: boolean): void {
    if (enabled) {
      this.bg.lineStyle(3, 0xffff00, 1); // Желтая рамка
    } else {
      this.bg.lineStyle(2, 0x000000, 1); // Черная рамка
    }
  }
}
