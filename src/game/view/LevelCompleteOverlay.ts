import { Scene, GameObjects, Tweens } from "phaser";

export class LevelCompleteOverlay {
  private scene: Scene;
  private bg: GameObjects.Rectangle;
  private container: GameObjects.Container;
  private onContinueCallback: () => void;

  constructor(scene: Scene, onContinue: () => void) {
    this.scene = scene;
    this.onContinueCallback = onContinue;
  }

  public show(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // 🌟 1. Затемненный фон на весь экран
    this.bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    this.bg.setOrigin(0, 0);
    this.bg.setScrollFactor(0); // 🌟 КРИТИЧЕСКИ ВАЖНО: фиксируем относительно экрана
    this.bg.setDepth(9998);
    this.bg.setAlpha(0); // Начинаем с прозрачности для анимации

    // 🌟 2. Контейнер для модального окна (центрируем его)
    this.container = this.scene.add.container(centerX, centerY);
    this.container.setScrollFactor(0); // 🌟 Фиксируем относительно экрана
    this.container.setDepth(9999);
    this.container.setScale(0.8); // Начинаем немного уменьшенным для анимации "pop-up"
    this.container.setAlpha(0);

    // 3. Фон окна (белый с закругленными углами и зеленой обводкой)
    const modalBg = this.scene.add.graphics();
    modalBg.fillStyle(0xffffff, 1);
    modalBg.fillRoundedRect(-200, -120, 400, 240, 20); // x, y, width, height, radius
    modalBg.lineStyle(4, 0x4caf50, 1);
    modalBg.strokeRoundedRect(-200, -120, 400, 240, 20);

    // 4. Заголовок
    const titleText = this.scene.add
      .text(0, -60, "🎉 Уровень пройден!", {
        fontFamily: "Arial, sans-serif",
        fontSize: "36px",
        color: "#333333",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // 5. Текст с результатами (заготовка на будущее)
    const statsText = this.scene.add
      .text(0, 0, "Все книги расставлены по своим местам.", {
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        color: "#666666",
      })
      .setOrigin(0.5);

    // 6. Кнопка "Продолжить"
    const buttonBg = this.scene.add.graphics();
    buttonBg.fillStyle(0x4caf50, 1);
    buttonBg.fillRoundedRect(-100, 70, 200, 50, 10);

    const buttonText = this.scene.add
      .text(0, 95, "Продолжить", {
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Делаем кнопку интерактивной (объединяем фон и текст в одну зону клика)
    const buttonZone = this.scene.add.zone(0, 95, 200, 50).setInteractive({ useHandCursor: true });

    // Анимации кнопки при наведении
    buttonZone.on("pointerover", () => {
      this.container.setScale(1.02); // Легкое увеличение всего окна
      buttonBg.clear();
      buttonBg.fillStyle(0x45a049, 1); // Темнее при наведении
      buttonBg.fillRoundedRect(-100, 70, 200, 50, 10);
    });

    buttonZone.on("pointerout", () => {
      this.container.setScale(1);
      buttonBg.clear();
      buttonBg.fillStyle(0x4caf50, 1);
      buttonBg.fillRoundedRect(-100, 70, 200, 50, 10);
    });

    buttonZone.on("pointerdown", () => {
      this.onContinueCallback();
    });

    // Добавляем все элементы в контейнер
    this.container.add([modalBg, titleText, statsText, buttonBg, buttonText, buttonZone]);

    // 🌟 7. Запускаем анимации появления
    this.scene.tweens.add({
      targets: this.bg,
      alpha: 0.7,
      duration: 300,
      ease: "Power2",
    });

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: "Back.out", // Эффект "пружины" при появлении
    });
  }

  public destroy(): void {
    // Плавное исчезновение перед удалением (опционально)
    this.scene.tweens.add({
      targets: [this.bg, this.container],
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        this.bg.destroy();
        this.container.destroy();
      },
    });
  }
}
