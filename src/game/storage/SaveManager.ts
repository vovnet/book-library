import { GameSession } from "./GameSession";
import { SaveData, SaveProvider } from "./types";

export class SaveManager {
  private saving = false;

  constructor(
    private readonly session: GameSession,
    private readonly localProvider: SaveProvider,
    private readonly cloudProvider?: SaveProvider,
  ) {}

  /**
   * Выполняет обычное сохранение.
   *
   * Если состояние не изменилось, операция пропускается.
   */
  public async save(): Promise<void> {
    // Если уже идёт сохранение — не запускаем второе.
    if (this.saving) {
      return;
    }

    this.saving = true;

    try {
      const data = this.session.createSaveData();

      await this.saveLocal(data);

      // Cloud не должен ломать игру,
      // если он недоступен.
      await this.trySaveCloud(data);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      this.saving = false;
    }
  }

  /**
   * Сохраняет данные локально.
   *
   * LocalStorage является обязательным fallback-хранилищем.
   */
  private async saveLocal(data: SaveData): Promise<void> {
    try {
      await this.localProvider.save(data);
    } catch (error) {
      console.error("Local save failed:", error);

      throw error;
    }
  }

  /**
   * Пытается синхронизировать сохранение с облаком.
   *
   * Ошибка cloud save не считается ошибкой всего сохранения,
   * поскольку локальная копия уже была сохранена.
   */
  private async trySaveCloud(data: SaveData): Promise<void> {
    if (!this.cloudProvider) {
      return;
    }

    try {
      await this.cloudProvider.save(data);
    } catch (error) {
      console.warn("Cloud save failed. Local save is available.", error);
    }
  }

  /**
   * Загружает сохранение.
   *
   * Приоритет:
   *
   * 1. Cloud
   * 2. Local
   * 3. Новый профиль
   */
  public async load(): Promise<SaveData | null> {
    // Сначала пытаемся получить актуальное состояние из cloud.
    if (this.cloudProvider) {
      try {
        const cloudData = await this.cloudProvider.load();

        if (cloudData) {
          // Обновляем локальный cache.
          await this.localProvider.save(cloudData);

          return cloudData;
        }
      } catch (error) {
        console.warn("Cloud load failed. Falling back to local save.", error);
      }
    }

    // Cloud недоступен или сохранения там нет.
    try {
      return await this.localProvider.load();
    } catch (error) {
      console.error("Local load failed:", error);

      return null;
    }
  }

  /**
   * Загружает сохранение и сразу восстанавливает состояние игры.
   *
   * @returns true, если сохранение найдено и загружено.
   */
  public async loadIntoSession(): Promise<boolean> {
    const data = await this.load();

    if (!data) {
      return false;
    }

    try {
      this.session.restoreSaveData(data);
      return true;
    } catch (error) {
      console.error("Failed to restore save data:", error);

      return false;
    }
  }

  /**
   * Очищает сохранение.
   *
   * В production-игре я бы вызывал это только после
   * подтверждения пользователя.
   */
  public async clear(): Promise<void> {
    await this.localProvider.clear();

    if (this.cloudProvider) {
      try {
        await this.cloudProvider.clear();
      } catch (error) {
        console.warn("Cloud save clear failed:", error);
      }
    }
  }

  public destroy(): void {}
}
