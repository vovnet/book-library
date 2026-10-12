import { Scene } from "phaser";
import { Library } from "../core/Library";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
  }

  create() {
    this.add
      .text(512, 490, "Make something fun!", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    const library = new Library(1);
    console.log(library.books);
  }
}
