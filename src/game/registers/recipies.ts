import { BoosterId } from "./boosters";
import { ResourceId } from "./resources";

export type BoosterIngredients = Partial<Record<ResourceId, number>>;

// 🌟 2. Полный рецепт: ингредиенты + время (в миллисекундах)
export interface BoosterRecipe {
  ingredients: BoosterIngredients;
  craftTimeMs: number; // Время крафта в миллисекундах (удобно для Phaser)
}

export type RecipeRegistry = Record<BoosterId, BoosterRecipe>;

export const craftingRecipies: RecipeRegistry = {
  hand: { ingredients: { "1": 8, "2": 5 }, craftTimeMs: 15000 },
  magnetto: { ingredients: { "2": 10, "3": 8, "4": 5 }, craftTimeMs: 24000 },
  intuition: { ingredients: { "3": 12, "4": 8, "5": 6 }, craftTimeMs: 42000 },
  hardIntuition: { ingredients: { "4": 17, "5": 12, "6": 5 }, craftTimeMs: 72000 },
};
