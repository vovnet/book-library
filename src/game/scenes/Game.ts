import { Scene } from "phaser";
import { Library } from "../core/Library";
import { RowView } from "../view/RowView";
import { FloorView } from "../view/FloorView";

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

    const floor = new FloorView(this, 450, 520, 800, 300, library.getBooksOnFloor(0), (book) => {
      console.log("click: ", book.model);
      book.flyTo(-20, -20, 800);
    });
  }
}
