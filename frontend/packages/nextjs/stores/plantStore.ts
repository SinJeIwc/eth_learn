import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PlantedSeed {
  id: string;
  x: number;
  y: number;
  seedType: string; // "wheat_seed", "grape_seed", "pumpkin_seed"
  plantedAt: number; // timestamp когда посадили
  growthTime: number; // время роста в миллисекундах (1 минута = 60000)
  tokenId?: number; // ID токена PlantNFT из контракта
}

interface PlantStore {
  plantedSeeds: PlantedSeed[];
  addPlantedSeed: (seed: PlantedSeed) => void;
  removePlantedSeed: (id: string) => void;
  getPlantedSeed: (x: number, y: number) => PlantedSeed | undefined;
  isPlotOccupied: (x: number, y: number) => boolean;
  isReadyToHarvest: (id: string) => boolean;
  clearAll: () => void;
}

export const usePlantStore = create<PlantStore>()(
  persist(
    (set, get) => ({
      plantedSeeds: [],

      addPlantedSeed: (seed: PlantedSeed) => {
        set(state => ({
          plantedSeeds: [...state.plantedSeeds.filter(s => s.x !== seed.x || s.y !== seed.y), seed],
        }));
      },

      removePlantedSeed: (id: string) => {
        set(state => ({
          plantedSeeds: state.plantedSeeds.filter(s => s.id !== id),
        }));
      },

      getPlantedSeed: (x: number, y: number) => {
        return get().plantedSeeds.find(s => s.x === x && s.y === y);
      },

      isPlotOccupied: (x: number, y: number) => {
        return get().plantedSeeds.some(s => s.x === x && s.y === y);
      },

      isReadyToHarvest: (id: string) => {
        const seed = get().plantedSeeds.find(s => s.id === id);
        if (!seed) return false;
        const now = Date.now();
        return now >= seed.plantedAt + seed.growthTime;
      },

      clearAll: () => {
        set({ plantedSeeds: [] });
      },
    }),
    {
      name: "plant-storage",
    },
  ),
);
