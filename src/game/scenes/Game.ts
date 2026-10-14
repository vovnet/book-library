import { Scene } from "phaser";
import { Library } from "../core/Library";
import { RowView } from "../view/RowView";
import { FloorView } from "../view/FloorView";
import { BookView } from "../view/BookView";

export class Game extends Scene {
  private library: Library;
  private rowViews: RowView[] = [];

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
  }

  create() {
    this.library = new Library(2, 3, 6, 9);

    // 2. Строим визуальные ряды (передаем Map слотов, чтобы вьюхи могли найти свои данные)
    let startY = 150;
    this.library.rows.forEach((rowData, index) => {
      const rowView = new RowView(this, 400, startY + index * 950, rowData, this.library.slots);
      this.rowViews.push(rowView);
      this.add.existing(rowView);
    });

    const floor = new FloorView(
      this,
      450,
      600,
      800,
      300,
      this.library.getBooksOnFloor(0),
      async (book) => {
        await book.flyTo(400, 400, 800);
        console.log("click: ", book.model);
        this.library.hand.push(book.model);
        book.model.location = "hand";
        console.log(this.library.hand);
      },
    );
  }
}
