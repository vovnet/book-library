import { BoosterId } from "../registers/boosters";
import { CraftingManager } from "./CraftingManager";
import { emitEvent } from "./EventBus";

interface ActiveCraft {
  boosterId: BoosterId;
  startTime: number; // Timestamp начала (Date.now())
  duration: number; // Полное время крафта в мс
  isCompleted: boolean;
}

export class CraftingProcessManager {
  private activeCrafts: Map<string, ActiveCraft> = new Map(); // key = уникальный ID крафта

  /**
   * Запускает крафт. Возвращает ID процесса для отслеживания.
   */
  public startCraft(boosterId: BoosterId): string | null {
    const duration = CraftingManager.getCraftTime(boosterId);
    if (duration <= 0) return null;

    const craftId = `${boosterId}_${Date.now()}`;

    this.activeCrafts.set(craftId, {
      boosterId,
      startTime: Date.now(),
      duration,
      isCompleted: false,
    });

    // emitEvent("craft-started", { craftId, boosterId, duration });
    return craftId;
  }

  /**
   * Возвращает прогресс крафта от 0.0 до 1.0
   */
  public getProgress(craftId: string): number {
    const craft = this.activeCrafts.get(craftId);
    if (!craft || craft.isCompleted) return 1;

    const elapsed = Date.now() - craft.startTime;
    return Math.min(1, elapsed / craft.duration);
  }

  /**
   * Проверяет и завершает готовые крафты.
   * Вызывай этот метод в update() сцены или по таймеру.
   */
  public checkCompletedCrafts(): BoosterId[] {
    const completed: BoosterId[] = [];

    this.activeCrafts.forEach((craft, craftId) => {
      if (craft.isCompleted) return;

      const elapsed = Date.now() - craft.startTime;
      if (elapsed >= craft.duration) {
        craft.isCompleted = true;
        completed.push(craft.boosterId);
        // emitEvent("craft-completed", { craftId, boosterId: craft.boosterId });
      }
    });

    return completed;
  }

  /**
   * Удаляет завершенный крафт из списка
   */
  public removeCraft(craftId: string): void {
    this.activeCrafts.delete(craftId);
  }

  /**
   * Сериализация для сохранения
   */
  public serialize(): any {
    return Array.from(this.activeCrafts.entries());
  }

  /**
   * Десериализация при загрузке
   */
  public deserialize(data: any[]): void {
    this.activeCrafts.clear();
    if (!data) return;

    for (const [key, craft] of data) {
      // При загрузке учитываем, что время могло пройти
      this.activeCrafts.set(key, craft);
    }
  }
}
