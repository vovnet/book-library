// core/MapConfig.ts

export interface BuildingPosition {
  x: number;
  y: number;
}

// 🌟 Жестко заданные координаты зданий в одном сегменте карты
// Это "шаблон", который будет повторяться бесконечно
export const BASE_POSITIONS: BuildingPosition[] = [
  { x: 100, y: 400 },
  { x: 300, y: 350 },
  { x: 450, y: 420 },
  { x: 700, y: 370 },
  { x: 960, y: 400 },
  { x: 1200, y: 410 },
  { x: 1500, y: 210 },
  { x: 1800, y: 360 },
  { x: 2100, y: 260 },
  { x: 2500, y: 310 },
  { x: 2900, y: 330 },
  { x: 3120, y: 440 },
];

// 🌟 Ширина одного сегмента (должна быть >= максимального X в BASE_POSITIONS)
export const SEGMENT_WIDTH = 3280;

// Сколько зданий генерировать вперед (за пределами экрана)
export const VISIBLE_AHEAD = 15;

// Сколько зданий показывать назад (пройденные уровни)
export const VISIBLE_BEHIND = 8;
