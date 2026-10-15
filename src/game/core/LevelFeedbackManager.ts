import { Scene } from "phaser";
import { Slot } from "../view/Slot";

export class LevelFeedbackManager {
  constructor(private scene: Scene) {}

  public async animateShelfCompletion(shelfSlots: Slot[]): Promise<void> {
    this.subtleCameraFlash();
    const promises = shelfSlots.map((target, index) => {
      if (!target.book) return Promise.resolve();
      return new Promise<void>((resolve) => {
        this.scene.time.delayedCall(index * 20, async () => {
          await target.book!.celebrate(15, 150);
          resolve();
        });
      });
    });
    await Promise.all(promises);
  }

  public triggerBookcaseAnimation(b: number, bookcaseSlots: Slot[]) {
    const shelfIndexes = [...new Set(bookcaseSlots.map((slot) => slot.shelfIndex))].sort(
      (a, b) => a - b,
    );

    shelfIndexes.forEach((shelfIdx) => {
      const currentShelfSlots = bookcaseSlots
        .filter((target) => target.shelfIndex === shelfIdx)
        .sort((a, b) => a.id.localeCompare(b.id));

      const shelfDelay = shelfIdx * 100;

      currentShelfSlots.forEach((target, slotIndex) => {
        if (target.book) {
          this.scene.time.delayedCall(shelfDelay + slotIndex * 50, () => {
            target.book!.celebrate(15, 150);
          });
        }
      });
    });
  }

  public showFloatingText(x: number, y: number, text: string, color: string = "#00ff00") {
    // Создаем текст чуть выше целевой точки
    const floatingText = this.scene.add
      .text(x, y - 10, text, {
        fontSize: "26px",
        color: color,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3, // Обводка для читаемости на любом фоне
      })
      .setOrigin(0.5);

    // Поднимаем текст над всеми элементами полки и книги
    floatingText.setDepth(150);

    // Анимируем: движение вверх и исчезновение
    this.scene.tweens.add({
      targets: floatingText,
      y: y - 40, // Конечная позиция Y (выше)
      alpha: 0, // Полная прозрачность в конце
      duration: 800, // Длительность анимации в мс
      ease: "Power2", // Плавное замедление
      onComplete: () => {
        floatingText.destroy(); // 🌟 КРИТИЧЕСКИ ВАЖНО: уничтожаем объект после анимации
      },
    });
  }

  /**
   * Создает легкую белую вспышку на экране с контролируемой прозрачностью
   * @param alpha Начальная прозрачность вспышки (от 0.1 до 1.0). Например, 0.25 = 25% белого.
   * @param duration Длительность затухания в миллисекундах (например, 300)
   */
  private subtleCameraFlash(alpha: number = 0.25, duration: number = 300): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // 1. Создаем белый прямоугольник на весь экран
    const flashOverlay = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0xffffff, // Белый цвет
      alpha, // 🌟 Начальная прозрачность
    );

    // 2. Поднимаем на самый верх, чтобы перекрыть всё (книги, текст, шкафы)
    flashOverlay.setDepth(9999);

    // 3. Анимируем плавное исчезновение
    this.scene.tweens.add({
      targets: flashOverlay,
      alpha: 0, // Конечная прозрачность
      duration: duration,
      ease: "Power2", // Плавное, естественное затухание
      onComplete: () => {
        // 🌟 КРИТИЧЕСКИ ВАЖНО: удаляем объект после анимации, чтобы не забивать память
        flashOverlay.destroy();
      },
    });
  }
}
