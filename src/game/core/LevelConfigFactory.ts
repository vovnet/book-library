// core/LevelConfigFactory.ts
import { HoverPickupStrategy, ClickPickupStrategy } from "./HandStrategies";
import { LevelConfig } from "./types";

export class LevelConfigFactory {
  /**
   * Создаёт конфиг уровня с дефолтными значениями.
   * Любое поле можно переопределить.
   */
  public static create(overrides: Partial<LevelConfig> = {}): LevelConfig {
    const config: LevelConfig = {
      pickupStrategy: new HoverPickupStrategy(64),
      placementEventName: "bookcase-clicked",
      highlightMode: "bookcases",
      ...overrides,
    };

    return config;
  }

  /**
   * Пресет: Клик по слотам (классический режим)
   */
  public static createSlotMode(): LevelConfig {
    return this.create({
      pickupStrategy: new ClickPickupStrategy(3),
      placementEventName: "slot-clicked",
      highlightMode: "slots",
    });
  }

  /**
   * Пресет: Клик по полкам
   */
  public static createShelfMode(): LevelConfig {
    return this.create({
      pickupStrategy: new ClickPickupStrategy(5),
      placementEventName: "shelf-clicked",
      highlightMode: "shelves",
    });
  }

  /**
   * Пресет: Клик по шкафам
   */
  public static createBookcaseMode(): LevelConfig {
    return this.create({
      pickupStrategy: new ClickPickupStrategy(9),
      placementEventName: "bookcase-clicked",
      highlightMode: "bookcases",
    });
  }

  /**
   * Пресет: Hover-режим (книги сами летят в нужный слот при наведении)
   */
  public static createHoverMode(): LevelConfig {
    return this.create({
      pickupStrategy: new HoverPickupStrategy(64),
      placementEventName: "book-hovered",
      highlightMode: "slots",
    });
  }
}
