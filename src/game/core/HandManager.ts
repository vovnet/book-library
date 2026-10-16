import { Scene } from "phaser";
import { Book } from "../view/Book";
import { HandLayoutStrategy } from "./HandStrategies";

export class HandManager {
  private books: Book[] = [];
  private strategy: HandLayoutStrategy;
  private scene: Scene;

  private handX: number;
  private handY: number;

  constructor(scene: Scene, initialStrategy: HandLayoutStrategy) {
    this.scene = scene;
    this.strategy = initialStrategy;
    this.handX = this.scene.cameras.main.centerX;
    this.handY = this.scene.cameras.main.centerY + 60;
  }

  public async addBook(book: Book): Promise<Book[] | false> {
    const capacity = this.strategy.getMaxCapacity();
    if (capacity > 0 && this.books.length >= capacity) {
      return false;
    }

    this.books.push(book);
    book.removePickupEvents();

    const positions = this.strategy.calculatePositions(this.books.length, this.handX, this.handY);
    const pos = positions[positions.length - 1];

    book.setLocation("hand");

    // 🌟 Новая книга летит из мира в руку через flyTo
    await book.flyTo(pos?.x || this.handX, pos?.y || this.handY);
    book.startLevitation();

    // 🌟 Остальные книги плавно подстраиваются через slideTo
    await this.updateLayout();

    return this.books;
  }

  public async removeBook(book: Book): Promise<void> {
    const index = this.books.indexOf(book);
    if (index === -1) return;

    // 1. Останавливаем левитацию и возвращаем мировые координаты,
    // чтобы книга могла нормально улететь в слот на полке
    this.strategy.removeLevitation(book);
    book.setScrollFactor(1);

    // 2. Удаляем книгу из массива
    this.books.splice(index, 1);

    // 3. 🌟 ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ: пересчитываем всю оставшуюся руку,
    // чтобы она красиво схлопнулась и осталась по центру
    if (this.books.length > 0) {
      await this.updateLayout();
    }
  }

  public getBooks(): Book[] {
    return this.books;
  }

  public getPickupMode() {
    return this.strategy.getPickupMode();
  }

  public clear(): void {
    this.books.forEach((b) => this.strategy.removeLevitation(b));
    this.books = [];
  }

  private async updateLayout(): Promise<void> {
    const positions = this.strategy.calculatePositions(this.books.length, this.handX, this.handY);
    const MOVE_THRESHOLD = 5; // Порог: если сдвиг меньше, не трогаем

    const promises = this.books.map((book, index) => {
      const pos = positions[index];
      if (!pos) return Promise.resolve();

      const dx = Math.abs(book.x - pos.x);
      const dy = Math.abs(book.y - pos.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Если сдвиг совсем маленький, пропускаем
      if (distance < MOVE_THRESHOLD) {
        return Promise.resolve();
      }

      // 🌟 Используем slideTo вместо flyTo для перемещения внутри руки
      return book.slideTo(pos.x, pos.y, 250).then(() => {
        book.setRotation(pos.rotation);
        book.setScale(pos.scale);
        // Левитация уже работает, не нужно её перезапускать
      });
    });

    await Promise.all(promises);
  }
}
