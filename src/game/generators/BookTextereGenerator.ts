import * as Phaser from "phaser";
import { Scene } from "phaser";

export const BOOK_COLORS = [
  0x8b4513, 0xa52a2a, 0x2f4f4f, 0x556b2f, 0x800000, 0x00008b, 0x4b0082, 0x8b0000, 0xd2691e,
  0x2e8b57, 0x483d8b, 0xcd853f,
];

export const PAGE_TINTS = [0xf5f5dc, 0xf0e68c, 0xe6d8ad, 0xd2b48c, 0xc9b896];

export type BookState = "floor" | "hand" | "slot";

export class BookTextureGenerator {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public bakeAll(): void {
    BOOK_COLORS.forEach((color, colorIndex) => {
      this.bakeFloorTexture(color, colorIndex);
      this.bakeHandTexture(color, colorIndex);
      this.bakeSlotTexture(color, colorIndex);
    });
  }

  private bakeFloorTexture(color: number, colorIndex: number): void {
    const cover = this.scene.textures.get("book-cover-floor");
    const width = cover.source[0].width;
    const height = cover.source[0].height;

    // 1. Создаем DynamicTexture (невидимая, живет в Texture Manager)
    const dt = this.scene.textures.addDynamicTexture(`book-floor-${colorIndex}`, width, height);

    // 2. Создаем временные спрайты с origin (0, 0) для точного позиционирования
    const coverSprite = this.scene.add.sprite(0, 0, "book-cover-floor");
    coverSprite.setOrigin(0, 0);
    coverSprite.setTint(color);

    const pagesSprite = this.scene.add.sprite(0, 0, "book-pages-floor");
    pagesSprite.setOrigin(0, 0);
    pagesSprite.setTint(this.getRandomPageTint());

    // 3. Добавляем команды в буфер
    dt?.draw(coverSprite, 0, 0);
    dt?.draw(pagesSprite, 0, 0);

    dt?.render();

    // 5. Очищаем временные объекты
    coverSprite.destroy();
    pagesSprite.destroy();
  }

  private bakeHandTexture(color: number, colorIndex: number): void {
    const cover = this.scene.textures.get("book-cover-hand");
    const width = cover.source[0].width;
    const height = cover.source[0].height;

    const dt = this.scene.textures.addDynamicTexture(`book-hand-${colorIndex}`, width, height);

    const coverSprite = this.scene.add.sprite(0, 0, "book-cover-hand");
    coverSprite.setOrigin(0, 0);
    coverSprite.setTint(color);

    const pagesSprite = this.scene.add.sprite(0, 0, "book-pages-hand");
    pagesSprite.setOrigin(0, 0);
    pagesSprite.setTint(this.getRandomPageTint());

    dt?.draw(coverSprite, 0, 0);
    dt?.draw(pagesSprite, 0, 0);
    dt?.render();

    coverSprite.destroy();
    pagesSprite.destroy();
  }

  private bakeSlotTexture(color: number, colorIndex: number): void {
    const cover = this.scene.textures.get("book-cover-slot");
    const width = cover.source[0].width;
    const height = cover.source[0].height;

    const dt = this.scene.textures.addDynamicTexture(`book-slot-${colorIndex}`, width, height);

    const coverSprite = this.scene.add.sprite(0, 0, "book-cover-slot");
    coverSprite.setOrigin(0, 0);
    coverSprite.setTint(color);

    dt?.draw(coverSprite, 0, 0);
    dt?.render();

    coverSprite.destroy();
  }

  private getRandomPageTint(): number {
    return Phaser.Utils.Array.GetRandom(PAGE_TINTS);
  }
}
