import { Scene } from "phaser";
import { Library } from "../core/Library";
import { RowView } from "../view/RowView";

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
  }
}
