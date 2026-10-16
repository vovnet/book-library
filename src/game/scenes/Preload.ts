import { Scene } from "phaser";
import { BookTextureGenerator } from "../generators/BookTextereGenerator";

export class Preload extends Scene {
  constructor() {
    super({ key: "Preload" });
  }

  preload() {
    // 1. Устанавливаем базовую папку для всех загружаемых файлов
    // Убедись, что папка 'assets' существует в корне твоего проекта (рядом с index.html)
    this.load.setPath("assets/");

    // 2. Создаем визуальные элементы загрузочного экрана
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Фон загрузочного экрана (темно-серый)
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Текст загрузки
    const loadingText = this.add
      .text(width / 2, height / 2 - 50, "Собираем библиотеку...", {
        fontFamily: "Arial, sans-serif",
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Рамка прогресс-бара
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 20, 320, 40);
    progressBox.lineStyle(2, 0x4caf50, 1); // Зеленая обводка
    progressBox.strokeRect(width / 2 - 160, height / 2 - 20, 320, 40);

    // Сам прогресс-бар (заполняющаяся часть)
    const progressBar = this.add.graphics();

    // Процент загрузки (текст)
    const percentText = this.add
      .text(width / 2, height / 2 + 40, "0%", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // 3. Настраиваем слушатели событий загрузки
    this.load.on("progress", (value: number) => {
      // value - это число от 0.0 до 1.0
      progressBar.clear();
      progressBar.fillStyle(0x4caf50, 1); // Зеленый цвет заполнения
      progressBar.fillRect(width / 2 - 150, height / 2 - 10, 300 * value, 20);

      // Обновляем текст процентов
      percentText.setText(Math.round(value * 100) + "%");
    });

    this.load.on("complete", () => {
      // Очищаем экран загрузки перед переходом
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 4. ЗАГРУЗКА АССЕТОВ
    // Замени имена файлов на реальные, которые ты положишь в папку assets/

    // Изображения
    this.load.image("bookcase", "case.png");
    this.load.image("base_book", "base_book.png");
    this.load.image("map-texture", "map.png");

    this.load.image("book-cover-floor", "cover-floor.png");
    this.load.image("book-pages-floor", "pages-floor.png");

    this.load.image("book-cover-hand", "cover-hand.png");
    this.load.image("book-pages-hand", "pages-hand.png");

    this.load.image("book-cover-slot", "cover-slot.png");

    // Звуки (раскомментируй, когда добавишь файлы)
    // this.load.audio("click", "sfx/click.mp3");
    // this.load.audio("success", "sfx/success.mp3");
    // this.load.audio("error", "sfx/error.mp3");

    // Шрифты (если используешь Bitmap Font или Google Fonts через WebFont loader)
    // this.load.bitmapFont("main-font", "fonts/font.png", "fonts/font.xml");
  }

  create() {
    const generator = new BookTextureGenerator(this);
    generator.bakeAll();

    this.scene.start("LevelMap");
  }
}
