import { Scene, GameObjects } from "phaser";

export type ButtonVariant = "primary" | "secondary" | "danger" | "success";

export interface ButtonConfig {
  text: string;
  iconFrame?: string; // Необязательная иконка из атласа "ui"
  variant?: ButtonVariant;
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  paddingX?: number; // Отступы слева и справа
  paddingY?: number; // Отступы сверху и снизу (влияют на высоту)
  iconSpacing?: number; // Расстояние между иконкой и текстом
  disabled?: boolean;
  align?: "left" | "center" | "right";
  onClick?: () => void;
}

export class UIButton extends GameObjects.Container {
  private bg: GameObjects.NineSlice;
  private icon?: GameObjects.Image;
  private textObj: GameObjects.Text;
  private isDisabled: boolean;
  private onClickCallback?: () => void;

  // Стандартные размеры "нерастягиваемых" углов для NineSlice (подстрой под свою текстуру!)
  private readonly CORNER_SIZE = 16;

  constructor(scene: Scene, x: number, y: number, config: ButtonConfig) {
    super(scene, x, y);

    this.isDisabled = config.disabled ?? false;
    this.onClickCallback = config.onClick;

    // 1. Создаем текст СРАЗУ, чтобы измерить его ширину
    this.textObj = scene.add
      .text(0, 0, config.text, {
        fontFamily: config.fontFamily || "Seym",
        fontSize: `${config.fontSize || 24}px`,
        color: this.isDisabled ? "#888888" : config.fontColor || "#ffffff",
      })
      .setOrigin(0, 0.5); // 🌟 Выравнивание по левому краю для удобства расчетов

    // 2. Создаем иконку (если есть)
    let iconWidth = 0;
    if (config.iconFrame) {
      this.icon = scene.add.image(0, 0, "ui", config.iconFrame).setOrigin(0, 0.5);
      if (this.isDisabled) this.icon.setTint(0x888888);
      iconWidth = this.icon.width;
    }

    // 3. 🌟 ВЫЧИСЛЯЕМ ИТОГОВУЮ ШИРИНУ
    const paddingX = config.paddingX ?? 32;
    const paddingY = config.paddingY ?? 16;
    const iconSpacing = config.iconSpacing ?? 12;

    const contentWidth = (this.icon ? iconWidth + iconSpacing : 0) + this.textObj.width;
    const finalWidth = Math.max(100, contentWidth + paddingX * 2); // Минимальная ширина 100px
    const finalHeight = Math.max(
      48,
      (this.icon?.height || 0) + paddingY * 2,
      this.textObj.height + paddingY * 2,
    );

    // 4. Создаем NineSlice фон
    const variantKey = config.variant || "primary";
    const textureMap: Record<ButtonVariant, string> = {
      primary: "btn-1",
      secondary: "btn-secondary",
      danger: "btn-danger",
      success: "btn-success",
    };

    this.bg = scene.add
      .nineslice(
        0,
        0,
        "ui", // Ключ атласа/текстуры
        textureMap[variantKey],
        finalWidth,
        finalHeight,
        this.CORNER_SIZE,
        this.CORNER_SIZE,
        this.CORNER_SIZE,
        this.CORNER_SIZE,
      )
      .setOrigin(0, 0.5); // 🌟 Тоже левое выравнивание

    if (this.isDisabled) {
      this.bg.setAlpha(0.6);
    }

    // 5. Позиционируем элементы внутри контейнера
    const align = config.align || "left";
    let contentOffsetX = 0;

    switch (align) {
      case "center":
        contentOffsetX = -finalWidth / 2;
        break;
      case "right":
        contentOffsetX = -finalWidth;
        break;
      case "left":
      default:
        contentOffsetX = 0;
        break;
    }

    // Позиционируем NineSlice
    this.bg.setPosition(contentOffsetX, 0);
    this.add(this.bg);

    // Позиционируем контент (иконку и текст)
    let currentX = contentOffsetX + paddingX;
    if (this.icon) {
      this.icon.setPosition(currentX, 0);
      this.add(this.icon);
      currentX += iconWidth + iconSpacing;
    }

    this.textObj.setPosition(currentX, 0);
    this.add(this.textObj);

    // 6. Интерактивность и анимации
    if (!this.isDisabled) {
      this.bg.setInteractive({ useHandCursor: true });

      this.bg.on("pointerover", () => {
        this.scene.tweens.add({ targets: this, scale: 1.05, duration: 100, ease: "Power2" });
        // if (!this.isDisabled) this.bg.setBrightness(1.2);
      });

      this.bg.on("pointerout", () => {
        this.scene.tweens.add({ targets: this, scale: 1.0, duration: 100, ease: "Power2" });
        // if (!this.isDisabled) this.bg.setBrightness(1.0);
      });

      this.bg.on("pointerdown", () => {
        this.scene.tweens.add({ targets: this, scale: 0.95, duration: 50, ease: "Power2" });
      });

      this.bg.on("pointerup", () => {
        this.scene.tweens.add({ targets: this, scale: 1.05, duration: 50, ease: "Power2" });
        if (this.onClickCallback) this.onClickCallback();
      });

      // Защита от "залипания" клика, если увели мышь
      this.bg.on("pointerupoutside", () => {
        this.scene.tweens.add({ targets: this, scale: 1.0, duration: 100, ease: "Power2" });
      });
    }
  }

  // 🌟 Публичные методы

  public setText(newText: string): void {
    this.textObj.setText(newText);
    // Примечание: для полноценного ресайза кнопки нужно пересчитать ширину и обновить bg.width.
    // Для большинства случаев текст не меняется динамически, но если нужно - дай знать, добавим метод resize().
  }

  public setDisabled(value: boolean): void {
    this.isDisabled = value;
    if (value) {
      this.bg.disableInteractive();
      this.bg.setAlpha(0.6);
      this.textObj.setColor("#888888");
      this.icon?.setTint(0x888888);
    } else {
      this.bg.setInteractive({ useHandCursor: true });
      this.bg.setAlpha(1);
      this.textObj.setColor("#ffffff");
      this.icon?.clearTint();
    }
  }

  public destroyComponent(): void {
    this.bg.removeAllListeners();
    this.destroy();
  }
}
