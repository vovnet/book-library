import { LevelConfigFactory } from "./LevelConfigFactory";
import { LevelConfig } from "./types";

export class LevelConfigBuilder {
  private config: Partial<LevelConfig> = {};

  public withClickPickup(): this {
    this.config.pickupStrategy = "byClick";
    return this;
  }

  public withHoverPickup(): this {
    this.config.pickupStrategy = "byHover";
    return this;
  }

  public withSlotHighlight(): this {
    this.config.highlightMode = "slots";
    this.config.placementEventName = "slot-clicked";
    return this;
  }

  public withShelfHighlight(): this {
    this.config.highlightMode = "shelves";
    this.config.placementEventName = "shelf-clicked";
    return this;
  }

  public withBookcaseHighlight(): this {
    this.config.highlightMode = "bookcases";
    this.config.placementEventName = "bookcase-clicked";
    return this;
  }

  public withMaxBooks(maxBooks: number): this {
    this.config.maxBooks = maxBooks;
    return this;
  }

  public build(): LevelConfig {
    return LevelConfigFactory.create(this.config);
  }
}
