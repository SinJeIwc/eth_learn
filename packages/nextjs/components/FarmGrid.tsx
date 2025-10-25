"use client";

import AnimatedPlant from "./AnimatedPlant";
import { FARM_CONFIG } from "@/lib/constants";
import { calculateGrowthProgress, seedIdToPlantType } from "@/lib/utils";
import { PlantedCrop } from "@/types/farm";

interface FarmGridProps {
  plantedCrops: PlantedCrop[];
  selectedSeed: boolean;
  onCellClick: (x: number, y: number) => void;
  onHarvest: (crop: PlantedCrop) => void;
}

export default function FarmGrid({ plantedCrops, selectedSeed, onCellClick, onHarvest }: FarmGridProps) {
  const renderCell = (x: number, y: number) => {
    const crop = plantedCrops.find(c => c.x === x && c.y === y);
    const progress = crop ? calculateGrowthProgress(crop.plantedAt, crop.item.growthTime) : 0;

    return (
      <div
        key={`${x}-${y}`}
        className={`w-16 h-16 border border-green-800 bg-green-900 cursor-pointer hover:bg-green-800 flex items-center justify-center relative transition-colors ${
          selectedSeed ? "hover:border-yellow-400" : ""
        }`}
        onClick={() => onCellClick(x, y)}
      >
        {crop && (
          <AnimatedPlant
            plantType={seedIdToPlantType(crop.item.id)}
            stage={crop.isReady ? "ready" : "growing"}
            progress={progress}
            width={48}
            height={48}
            onClick={() => {
              if (crop.isReady) {
                onHarvest(crop);
              }
            }}
          />
        )}
      </div>
    );
  };

  const cells = [];
  for (let y = 0; y < FARM_CONFIG.GRID_HEIGHT; y++) {
    for (let x = 0; x < FARM_CONFIG.GRID_WIDTH; x++) {
      cells.push(renderCell(x, y));
    }
  }

  return (
    <div className="flex justify-center">
      <div
        className="grid gap-1 bg-green-800 p-4 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${FARM_CONFIG.GRID_WIDTH}, minmax(0, 1fr))`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}
