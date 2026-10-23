import { Scene, GameObjects } from "phaser";

export interface ToggleConfig {
  x: number;
  y: number;
  textureKey: string;
  frame?: string | number;
  initialState?: boolean;
  offTint?: number; // Цвет tint в выключенном состоянии (по умолчанию серый)
  onTint?: number; // Цвет tint во включенном состоянии (по умолчанию белый)
  scale?: number;
  disabled?: boolean;
}

export class Toggle extends GameObjects.Container {
  private icon: GameObjects.Image;
  private isOn: boolean;
  private isDisabled: boolean;

  private onChangeCallback: ((isOn: boolean) => void) | null = null;

  constructor(scene: Scene, config: ToggleConfig) {
    super(scene, config.x, config.y);

    this.isOn = config.initialState ?? false;
    this.isDisabled = config.disabled ?? false;

    // Создаём иконку
    this.icon = scene.add.image(0, 0, config.textureKey, config.frame);
    this.icon.enableFilters();

    if (config.scale) {
      this.icon.setScale(config.scale);
    }

    this.add(this.icon);

    // Применяем начальное состояние
    this.applyTint();

    // Интерактивность
    if (!this.isDisabled) {
      this.icon.setInteractive({ useHandCursor: true });
      this.icon.on("pointerdown", this.handleToggle, this);
      this.icon.on("pointerover", this.handleHover, this);
      this.icon.on("pointerout", this.handleOut, this);
    }
  }

  private handleToggle(): void {
    if (this.isDisabled) return;
    this.setOn(!this.isOn);
  }

  private handleHover(): void {
    if (this.isDisabled) return;

    this.scene.tweens.add({
      targets: this.icon,
      scale: 1.1,
      duration: 100,
      ease: "Power2",
    });
  }

  private handleOut(): void {
    if (this.isDisabled) return;

    this.scene.tweens.add({
      targets: this.icon,
      scale: 1,
      duration: 100,
      ease: "Power2",
    });
  }

  /**
   * Применяет tint с плавной анимацией
   */
  private applyTint(): void {
    if (this.isOn) {
      this.icon.filters?.internal.clear();
    } else {
      this.icon.filters?.internal.addColorMatrix().colorMatrix.sepia();
    }
  }

  // 🌟 Публичные методы

  /**
   * Устанавливает состояние переключателя
   */
  public setOn(value: boolean, emitEvent: boolean = true): void {
    if (this.isOn === value) return;

    this.isOn = value;
    this.applyTint();

    if (emitEvent && this.onChangeCallback) {
      this.onChangeCallback(this.isOn);
    }
  }

  /**
   * Возвращает текущее состояние
   */
  public getIsOn(): boolean {
    return this.isOn;
  }

  /**
   * Подписка на изменение состояния
   */
  public onChange(callback: (isOn: boolean) => void): this {
    this.onChangeCallback = callback;
    return this;
  }

  /**
   * Включает/выключает интерактивность
   */
  public setDisabled(value: boolean): void {
    this.isDisabled = value;

    if (value) {
      this.icon.disableInteractive();
      this.icon.setAlpha(0.5);
    } else {
      this.icon.setInteractive({ useHandCursor: true });
      this.icon.setAlpha(1);
    }
  }

  /**
   * Полное уничтожение компонента
   */
  public destroyComponent(): void {
    this.icon.off("pointerdown", this.handleToggle, this);
    this.icon.off("pointerover", this.handleHover, this);
    this.icon.off("pointerout", this.handleOut, this);
    this.onChangeCallback = null;
    this.destroy();
  }
}
