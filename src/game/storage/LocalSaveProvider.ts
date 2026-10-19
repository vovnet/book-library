import { SaveData, SaveProvider } from "./types";

export class LocalSaveProvider implements SaveProvider {
  private readonly key = "book_game_save";

  async load(): Promise<SaveData | null> {
    const raw = localStorage.getItem(this.key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error("Failed to load local save:", error);
      return null;
    }
  }

  async save(data: SaveData): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.key);
  }
}
