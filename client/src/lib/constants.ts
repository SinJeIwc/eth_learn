// Game configuration constants
export const FARM_CONFIG = {
  GRID_WIDTH: 8,
  GRID_HEIGHT: 6,
  CELL_SIZE: 64,
} as const;

export const PLANT_SPRITE_CONFIG = {
  wheat: { frames: 3, spriteWidth: 32, spriteHeight: 32 },
  grape: { frames: 3, spriteWidth: 32, spriteHeight: 32 },
  pumpkin: { frames: 3, spriteWidth: 32, spriteHeight: 32 },
} as const;

export const IMAGE_CONFIG = {
  FORMATS: [".png", ".jpg"] as const,
  DEFAULT_SIZE: { width: 48, height: 48 },
} as const;

export const UI_PATHS = {
  BACKGROUND: "/background.png",
  BACKPACK: "/backpack.png",
  MARKET: "/market.png",
  LOGOUT: "/logout.png",
  CLOSE: "/UI/x.png",
} as const;

export type PlantType = "wheat" | "grape" | "pumpkin";
