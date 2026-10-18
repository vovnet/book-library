import { BlendModes, Scene } from "phaser";
import { Slot } from "../view/Slot";

export class LevelFeedbackManager {
  constructor(private scene: Scene) {}

  public async animateShelfCompletion(shelfSlots: Slot[]): Promise<void> {
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
    this.subtleCameraFlash();
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

  private subtleCameraFlash(strength: number = 0.2, duration: number = 400): void {
    const camera = this.scene.cameras.main;

    const vignetteFilter = camera.filters.external.addVignette(
      0.5, // x: центр по горизонтали (0.5 = 50% ширины камеры)
      0.5, // y: центр по вертикали (0.5 = 50% высоты камеры)
      2, // radius: размер "чистой" зоны в центре (0.0 - весь экран, 1.0 - только края)
      strength, // strength: начальная сила/непрозрачность эффекта
      0xffffff, // color: белый цвет для эффекта вспышки
      BlendModes.SCREEN, // blendMode: критически важно для вспышек! SCREEN или ADD делают свет "светящимся"
    );

    this.scene.tweens.add({
      targets: vignetteFilter,
      strength: 0,
      duration: duration,
      ease: "Power2",
      onComplete: () => {
        camera.filters.external.remove(vignetteFilter);
      },
    });
  }
}
