import { Scene } from "phaser";
import { Library } from "../core/Library";
import { RowView } from "../view/RowView";
import { BookView } from "../view/BookView";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
  }

  create() {
    const library = new Library(1);
    console.log({ ...library });

    const row = new RowView(this, 400, 200, 0, 3, 6, 9);
    this.add.existing(row);

    this.add.existing(
      new BookView(this, {
        color: 0xfff,
        width: 20,
        height: 30,
        x: 400,
        y: 500,
        symbol: "A",
        model: { id: "book-1", location: "floor", targetSlotId: "" },
        onClick: (book) => book.flyTo(0, 0, 1200),
      }),
    );
  }
}
