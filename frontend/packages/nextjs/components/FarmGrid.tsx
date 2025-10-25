"use client";

import AnimatedPlant from "./AnimatedPlant";
import { FARM_CONFIG } from "~~/lib/constants";
import { calculateGrowthProgress, seedIdToPlantType } from "~~/lib/utils";
import type { PlantedCrop } from "~~/types/farm";

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

    const handleCellClick = () => {
      onCellClick(x, y);
    };

    const handleHarvest = () => {
      if (crop?.isReady) {
        onHarvest(crop);
      }
    };

    return (
      <button
        type="button"
        key={`${x}-${y}`}
        className={`
          aspect-square w-full
          border-2 border-green-700/50 
          bg-gradient-to-br from-green-900 via-green-800 to-green-900
          hover:from-green-800 hover:via-green-700 hover:to-green-800
          active:scale-95
          flex items-center justify-center 
          relative transition-all duration-200
          rounded-sm shadow-inner
          ${selectedSeed ? "hover:border-yellow-400 hover:shadow-yellow-400/50" : ""}
          ${crop?.isReady ? "animate-pulse-fast border-yellow-500/70" : ""}
        `}
        onClick={handleCellClick}
        aria-label={`Cell ${x},${y}${crop ? ` - ${crop.isReady ? "Ready to harvest" : "Growing"}` : ""}`}
      >
        {crop && (
          <AnimatedPlant
            plantType={seedIdToPlantType(crop.item.id)}
            stage={crop.isReady ? "ready" : "growing"}
            progress={progress}
            width={48}
            height={48}
            onClick={handleHarvest}
          />
        )}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1 left-1 w-1 h-1 bg-green-600 rounded-full" />
          <div className="absolute bottom-2 right-2 w-1 h-1 bg-green-600 rounded-full" />
        </div>
      </button>
    );
  };

  const cells = [];
  for (let y = 0; y < FARM_CONFIG.GRID_HEIGHT; y++) {
    for (let x = 0; x < FARM_CONFIG.GRID_WIDTH; x++) {
      cells.push(renderCell(x, y));
    }
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full max-w-7xl">
        <div
          className="
            grid gap-1 sm:gap-2 md:gap-3
            bg-gradient-to-br from-amber-900/30 via-green-900/40 to-emerald-900/30
            p-3 sm:p-4 md:p-6 lg:p-8
            rounded-2xl 
            shadow-2xl
            border-4 border-amber-800/50
            backdrop-blur-sm
          "
          style={{
            gridTemplateColumns: `repeat(${FARM_CONFIG.GRID_WIDTH}, minmax(0, 1fr))`,
          }}
        >
          {cells}
        </div>
      </div>
    </div>
  );
}
