"use client";

import SafeImage from "./SafeImage";
import { PlantType } from "@/lib/constants";
import { getPlantAssetPath } from "@/lib/utils";

interface AnimatedPlantProps {
  plantType: PlantType;
  stage: "growing" | "ready";
  progress: number; // 0-1
  width?: number;
  height?: number;
  onClick?: (e?: React.MouseEvent) => void;
}

export default function AnimatedPlant({
  plantType,
  stage,
  progress,
  width = 48,
  height = 48,
  onClick,
}: AnimatedPlantProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

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

  return (
    <div className="cursor-pointer relative" onClick={handleClick} style={{ width, height }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <SafeImage
          src={getPlantAssetPath(plantType, "seed")}
          alt="Growing seed"
          width={width}
          height={height}
          className="object-contain"
          fallbackText="🌱"
        />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-60 transition-all duration-1000"
          style={{ height: `${progress * 100}%` }}
        >
          <div className="absolute inset-0 bg-green-400 bg-opacity-20" />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          {Math.floor(progress * 100)}%
        </span>
      </div>

      <div className="absolute -bottom-1 left-0 w-full h-1 bg-gray-600 rounded overflow-hidden">
        <div
          className="h-full bg-green-400 rounded transition-all duration-1000"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
