import * as Phaser from "phaser";
import { GameObjects, Scene } from "phaser";

export class Tooltip {
  private bg: GameObjects.Rectangle;
  private text: GameObjects.Text;
  private scene: Scene;
  private hideTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Scene) {
    this.scene = scene;

    // Создаем текст с максимальной глубиной
    this.text = scene.add
      .text(0, 0, "", {
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(9999)
      .setVisible(false);

    // Создаем фон под текст
    this.bg = scene.add
      .rectangle(0, 0, 20, 20, 0x000000, 0.85)
      .setOrigin(0.5, 1)
      .setDepth(9998)
      .setStrokeStyle(1, 0xffffff, 0.5)
      .setVisible(false);
  }

  // 🌟 Показать подсказку над указанным объектом
  public show(targetX: number, targetY: number, message: string, durationMs: number = 2000) {
    // Если таймер уже тикает, сбрасываем его
    if (this.hideTimer) {
      this.hideTimer.remove();
    }

    // Устанавливаем текст
    this.text.setText(message);

    // Динамически подстраиваем ширину фона под размер текста
    const bounds = this.text.getBounds();
    this.bg.setSize(bounds.width + 16, bounds.height + 8);

    // Позиционируем над целью (смещение на 25 пикселей вверх)
    this.bg.setPosition(targetX, targetY - 25);
    this.text.setPosition(targetX, targetY - 25);

    // Показываем
    this.bg.setVisible(true);
    this.text.setVisible(true);

    // Запускаем таймер на автоматическое скрытие
    this.hideTimer = this.scene.time.delayedCall(durationMs, () => {
      this.hide();
    });
  }

  // 🌟 Принудительно скрыть
  public hide() {
    if (this.hideTimer) {
      this.hideTimer.remove();
      this.hideTimer = null;
    }
    this.bg.setVisible(false);
    this.text.setVisible(false);
  }

  // 🌟 Очистка при уничтожении сцены
  public destroy() {
    this.hide();
    this.bg.destroy();
    this.text.destroy();
  }
}
