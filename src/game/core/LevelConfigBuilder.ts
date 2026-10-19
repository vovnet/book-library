import { ClickPickupStrategy, HoverPickupStrategy } from "./HandStrategies";
import { LevelConfigFactory } from "./LevelConfigFactory";
import { LevelConfig } from "./types";

export class LevelConfigBuilder {
  private config: Partial<LevelConfig> = {};

  public withClickPickup(maxBooks: number): this {
    this.config.pickupStrategy = new ClickPickupStrategy(maxBooks);
    return this;
  }

  public withHoverPickup(maxBooks: number): this {
    this.config.pickupStrategy = new HoverPickupStrategy(maxBooks);
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

  public build(): LevelConfig {
    return LevelConfigFactory.create(this.config);
  }
}
