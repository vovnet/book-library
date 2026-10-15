import { Scene } from "phaser";
import { Book } from "../view/Book";
import { HandLayoutStrategy } from "./HandStrategies";

export class HandManager {
  private books: Book[] = [];
  private strategy: HandLayoutStrategy;
  private scene: Scene;

  constructor(scene: Scene, initialStrategy: HandLayoutStrategy) {
    this.scene = scene;
    this.strategy = initialStrategy;
  }

  public async addBook(book: Book) {
    const capacity = this.strategy.getMaxCapacity();
    if (capacity > 0 && this.books.length >= capacity) {
      return false;
    }

    this.books.push(book);
    book.removePickupEvents();
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    await book.flyTo(centerX, centerY);
    book.startLevitation();
    this.updateLayout();
    return this.books;
  }

  public async removeBook(book: Book) {
    this.strategy.removeLevitation(book);
    this.books = this.books.filter((b) => b !== book);
    this.updateLayout();
  }

  public setStrategy(newStrategy: HandLayoutStrategy) {
    this.books.forEach((b) => this.strategy.removeLevitation(b));
    this.strategy = newStrategy;
    this.updateLayout();
  }

  public getBooks(): Book[] {
    return this.books;
  }

  public getPickupMode() {
    return this.strategy.getPickupMode();
  }

  public clear() {
    this.books.forEach((b) => this.strategy.removeLevitation(b));
    this.books = [];
  }

  // 🌟 Менеджер применяет данные стратегии через flyTo
  private updateLayout() {
    console.log("update layout");
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // 1. Стратегия возвращает массив позиций
    const positions = this.strategy.calculatePositions(this.books.length, centerX, centerY);

    // 2. Менеджер применяет каждую позицию к соответствующей книге через flyTo
    this.books.forEach((book, index) => {
      const pos = positions[index];
      if (!pos) return;

      // todo
      // this.scene.tweens.add({ targets: book });

      // book.flyTo(pos.x, pos.y, 300).then(() => {
      //   book.setRotation(pos.rotation);
      //   book.setScale(pos.scale);
      //   this.strategy.applyLevitation(book);
      // });
    });
  }
}
