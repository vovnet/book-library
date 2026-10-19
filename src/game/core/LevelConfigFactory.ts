import { LevelConfig } from "./types";

export class LevelConfigFactory {
  /**
   * Создаёт конфиг уровня с дефолтными значениями.
   * Любое поле можно переопределить.
   */
  public static create(overrides: Partial<LevelConfig> = {}): LevelConfig {
    const config: LevelConfig = {
      pickupStrategy: "byClick",
      placementEventName: "bookcase-clicked",
      highlightMode: "bookcases",
      maxBooks: 1,
      ...overrides,
    };

    return config;
  }
}
