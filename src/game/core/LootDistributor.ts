import { Math as PhaserMath } from "phaser";
import { ResourceId } from "../registers/resources";
import { Book } from "../view/Book";
import { LevelResourceConfig } from "./types";

export class LootDistributor {
  /**
   * Распределяет ресурсы по книгам на полу.
   * @param floorBooks Массив книг, которые сейчас лежат на полу
   * @param lootConfig Конфиг того, что должно выпасть
   */
  public static distribute(floorBooks: Book[], lootConfig: LevelResourceConfig[]): void {
    // 1. Создаем "колоду" дропа
    const dropDeck: (ResourceId | null)[] = [];

    // Добавляем запрошенные ресурсы
    lootConfig.forEach((loot) => {
      for (let i = 0; i < loot.amount; i++) {
        dropDeck.push(loot.id);
      }
    });

    // 2. Заполняем остаток колоды "пустышками" (null)
    const emptySlotsNeeded = Math.max(0, floorBooks.length - dropDeck.length);
    for (let i = 0; i < emptySlotsNeeded; i++) {
      dropDeck.push(null);
    }

    // ⚠️ ВАЖНО: Если ресурсов больше, чем книг, обрезаем колоду
    // (или можно модифицировать логику, чтобы в одну книгу класть несколько)
    if (dropDeck.length > floorBooks.length) {
      dropDeck.length = floorBooks.length;
    }

    const shuffledDeck = PhaserMath.RND.shuffle(dropDeck);

    // 4. Раздаем "карты" книгам
    floorBooks.forEach((book, index) => {
      book.setResourceId(shuffledDeck[index]);
    });
  }
}
