"use client";

import SafeImage from "./SafeImage";
import { PlantType } from "@/lib/constants";
import { getPlantAssetPath } from "@/lib/utils";

interface AnimatedPlantProps {
  plantType: PlantType;
  stage: "growing" | "ready";
  width?: number;
  height?: number;
  onClick?: (e?: React.MouseEvent) => void;
}

export default function AnimatedPlant({ plantType, stage, width = 48, height = 48, onClick }: AnimatedPlantProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  // Готовый плод - показываем fetus
  if (stage === "ready") {
    return (
      <div className="cursor-pointer relative" onClick={handleClick}>
        <SafeImage
          src={getPlantAssetPath(plantType, "fetus")}
          alt="Ready crop"
          width={width}
          height={height}
          className="object-contain"
          fallbackText="🌾"
        />
        {/* Ready to harvest indicator */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
      </div>
    );
  }

  // Растущее растение - показываем seed (росток)
  return (
    <div className="cursor-pointer relative" onClick={handleClick}>
      <SafeImage
        src={getPlantAssetPath(plantType, "seed")}
        alt="Growing plant"
        width={width}
        height={height}
        className="object-contain"
        fallbackText="🌱"
      />
    </div>
  );
}
