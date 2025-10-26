export const FARM_GRID_CONFIG = {
  rows: 6,
  cols: 8,
  totalCells: 48,
  cellSize: 80,
};

export const SEED_GROWTH_TIME = {
  wheat: 30,
  grape: 60,
  pumpkin: 45,
} as const;

export const SEED_STAGES = {
  wheat: [
    "/Plants/wheat/wheat_seed.png",
    "/Plants/wheat/wheat_stage1.png",
    "/Plants/wheat/wheat_stage2.png",
    "/Plants/wheat/wheat_stage3.png",
    "/Plants/wheat/wheat_stage4.png",
  ],
  grape: [
    "/Plants/grape/grape_seed.png",
    "/Plants/grape/grape_stage1.png",
    "/Plants/grape/grape_stage2.png",
    "/Plants/grape/grape_stage3.png",
    "/Plants/grape/grape_stage4.png",
  ],
  pumpkin: [
    "/Plants/pumpkin/pumpkin_seed.png",
    "/Plants/pumpkin/pumpkin_stage1.png",
    "/Plants/pumpkin/pumpkin_stage2.png",
    "/Plants/pumpkin/pumpkin_stage3.png",
    "/Plants/pumpkin/pumpkin_stage4.png",
  ],
};

export type SeedType = keyof typeof SEED_GROWTH_TIME;

export interface PlantedCell {
  cellId: number;
  seedType: SeedType;
  plantedAt: number;
  plantNftId?: number;
}

export const getCellId = (row: number, col: number) => row * FARM_GRID_CONFIG.cols + col;
export const getRowCol = (cellId: number) => ({
  row: Math.floor(cellId / FARM_GRID_CONFIG.cols),
  col: cellId % FARM_GRID_CONFIG.cols,
});

export const getGrowthProgress = (plantedAt: number, seedType: SeedType): number => {
  const elapsed = (Date.now() - plantedAt) / 1000;
  const duration = SEED_GROWTH_TIME[seedType];
  return Math.min(elapsed / duration, 1);
};

export const getGrowthStage = (progress: number): number => {
  if (progress >= 1) return 4;
  if (progress >= 0.75) return 3;
  if (progress >= 0.5) return 2;
  if (progress >= 0.25) return 1;
  return 0;
};

export const isReadyToHarvest = (plantedAt: number, seedType: SeedType): boolean => {
  return getGrowthProgress(plantedAt, seedType) >= 1;
};
