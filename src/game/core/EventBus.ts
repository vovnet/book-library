// core/EventBus.ts
import { Events } from "phaser";
import { SlotView } from "../view/SlotView";

// Создаем единственный экземпляр шины событий на всю игру
export const EventBus = new Events.EventEmitter();

// (Опционально, но очень рекомендуется для TypeScript)
// Описываем типы событий, чтобы IDE давала подсказки
export interface GameEvents {
  "slot-clicked": (slotView: SlotView) => void;
  "book-selected": (bookId: string) => void;
  "level-completed": () => void;
}

// Типобезопасная обертка (чтобы не опечататься в названиях событий)
export const emitEvent = <K extends keyof GameEvents>(
  event: K,
  ...args: Parameters<GameEvents[K]>
) => {
  EventBus.emit(event, ...args);
};

export const onEvent = <K extends keyof GameEvents>(event: K, fn: GameEvents[K], context?: any) => {
  EventBus.on(event, fn, context);
};

export const offEvent = <K extends keyof GameEvents>(
  event: K,
  fn: GameEvents[K],
  context?: any,
) => {
  EventBus.off(event, fn, context);
};
