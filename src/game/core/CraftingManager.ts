import { BoosterId } from "../registers/boosters";
import { BoosterRecipe, craftingRecipies } from "../registers/recipies";
import { ResourceId } from "../registers/resources";

export class CraftingManager {
  /**
   * Проверяет, может ли игрок скрафтить бустер с текущими ресурсами
   */
  public static canCraft(
    boosterId: BoosterId,
    playerResources: Record<ResourceId, number>,
  ): boolean {
    const recipe = craftingRecipies[boosterId];
    if (!recipe) return false;

    // Проходим по всем ингредиентам рецепта
    for (const [resId, requiredAmount] of Object.entries(recipe.ingredients)) {
      // ?? 0 защищает от undefined, если у игрока еще не было этого ресурса
      const playerAmount = playerResources[resId as ResourceId] ?? 0;

      if (playerAmount < requiredAmount) {
        return false; // Не хватает хотя бы одного ресурса
      }
    }

    return true;
  }

  /**
   * Списывает ресурсы за крафт.
   * ⚠️ ВАЖНО: Вызывай этот метод ТОЛЬКО после проверки canCraft!
   */
  public static consumeResources(
    boosterId: BoosterId,
    playerResources: Record<ResourceId, number>,
  ): void {
    const recipe = craftingRecipies[boosterId];
    if (!recipe) return;

    for (const [resId, requiredAmount] of Object.entries(recipe.ingredients)) {
      const currentAmount = playerResources[resId as ResourceId] ?? 0;
      playerResources[resId as ResourceId] = currentAmount - requiredAmount;
    }
  }

  public static getRecipe(boosterId: BoosterId): BoosterRecipe | undefined {
    return craftingRecipies[boosterId];
  }

  public static getCraftTime(boosterId: BoosterId): number {
    return craftingRecipies[boosterId]?.craftTimeMs ?? 0;
  }

  public static getIngredients(boosterId: BoosterId): Record<string, number> {
    return craftingRecipies[boosterId]?.ingredients ?? {};
  }
}
