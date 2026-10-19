import { Scene } from "phaser";
import { StartLevelModal } from "../view/StartLevelModal";

export class UIScene extends Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    // Эта сцена ничего не рисует по умолчанию
    // Она существует только для показа модалок и UI-оверлеев
  }

  // Метод для показа модалки из любой другой сцены
  public showStartLevelModal(
    onConfirm: (selections: Record<string, boolean>) => void,
    onCancel: () => void,
  ) {
    new StartLevelModal(this, onConfirm, onCancel);
  }
}
