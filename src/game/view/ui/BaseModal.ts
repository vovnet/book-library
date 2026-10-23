// view/ui/BaseModal.ts
import { Scene, GameObjects, Geom } from "phaser";

export abstract class BaseModal extends GameObjects.Container {
  protected readonly modalWidth: number;
  protected readonly modalHeight: number;

  // Точка Y, с которой начинается контент (под заголовком)
  protected readonly contentStartY: number;

  constructor(scene: Scene, title: string, width: number, height: number) {
    // Центрируем модалку на экране
    super(scene, scene.scale.width / 2, scene.scale.height / 2);

    this.modalWidth = width;
    this.modalHeight = height;
    this.contentStartY = -height / 2 + 90; // Отступ вниз от заголовка

    scene.add.existing(this);
    this.setDepth(1000);
    this.setScrollFactor(0); // 🌟 КРИТИЧЕСКИ ВАЖНО для UI

    this.buildBaseUI(title);

    // Анимация появления
    this.setScale(0.8).setAlpha(0);
    scene.tweens.add({
      targets: this,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: "Back.out",
    });
  }

  private buildBaseUI(title: string) {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    // 1. Оверлей (закрывает модалку при клике)
    const overlay = this.scene.add.rectangle(0, 0, w * 2, h * 2, 0x000000, 0.7);
    overlay.setInteractive(new Geom.Rectangle(0, 0, w * 2, h * 2), Geom.Rectangle.Contains);
    this.add(overlay);

    // 2. Фон модалки (NineSlice)
    const bg = this.scene.add.nineslice(
      0,
      0,
      "ui",
      "modal",
      this.modalWidth,
      this.modalHeight,
      36,
      36,
      50,
      50,
    );
    // Явная hitArea для надежности
    bg.setInteractive(
      new Geom.Rectangle(
        -this.modalWidth / 2,
        -this.modalHeight / 2,
        this.modalWidth,
        this.modalHeight,
      ),
      Geom.Rectangle.Contains,
    );
    this.add(bg);

    // 3. Декоративная шапка
    this.add(this.scene.add.image(0, -this.modalHeight / 2, "ui", "modal-head").setOrigin(0.5, 0));

    // 4. Заголовок
    this.add(
      this.scene.add
        .text(0, -this.modalHeight / 2 + 40, title, {
          fontFamily: "Seym",
          fontSize: "28px",
          color: "#ffffff",
          // fontStyle: "bold",
        })
        .setOrigin(0.5),
    );

    // 5. Кнопка закрытия
    const closeBtn = this.scene.add
      .sprite(this.modalWidth / 2 - 6, -this.modalHeight / 2 + 8, "ui", "close-btn")
      .setInteractive({ useHandCursor: true });

    closeBtn.on("pointerdown", () => this.onDismiss());
    this.add(closeBtn);
  }

  /**
   * Этот метод должны реализовать дочерние классы для отрисовки своего контента.
   * Добавляйте элементы прямо в `this` (контейнер модалки), используя координаты относительно центра.
   */
  protected abstract buildContent(): void;

  /**
   * Стандартная анимация закрытия.
   * @param onComplete Функция, которая выполнится после полного исчезновения
   */
  protected playCloseAnimation(onComplete: () => void): void {
    this.scene.tweens.add({
      targets: this,
      scale: 0.8,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  /**
   * Вызывается при клике на оверлей или крестик
   */
  protected onDismiss(): void {
    this.playCloseAnimation(() => {
      // Базовый класс ничего не делает при отмене,
      // но дочерний может переопределить этот метод при необходимости
    });
  }
}
