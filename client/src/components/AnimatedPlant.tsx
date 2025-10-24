"use client";

import { useMemo } from "react";
import SafeImage from "./SafeImage";
import { PLANT_SPRITE_CONFIG, PlantType } from "@/lib/constants";
import { getPlantAssetPath } from "@/lib/utils";

interface AnimatedPlantProps {
  plantType: PlantType;
  stage: "growing" | "ready";
  progress: number; // 0-1
  width?: number;
  height?: number;
  onClick?: (e?: React.MouseEvent) => void;
}

/**
 * AnimatedPlant - Displays a plant with sprite-based growth animation
 */
export default function AnimatedPlant({
  plantType,
  stage,
  progress,
  width = 48,
  height = 48,
  onClick,
}: AnimatedPlantProps) {
  const config = PLANT_SPRITE_CONFIG[plantType];

  // Calculate current frame based on progress
  const currentFrame = useMemo(() => {
    if (stage === "growing") {
      const frameIndex = Math.floor(progress * config.frames);
      return Math.min(frameIndex, config.frames - 1);
    }
    return 0;
  }, [progress, stage, config.frames]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  // Ready plants show final crop image
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
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
      </div>
    );
  }

  // Growing plants show animated sprite
  const scaleFactor = width / config.spriteWidth;

  return (
    <div
      className="cursor-pointer relative overflow-hidden"
      onClick={handleClick}
      style={{ width, height }}
    >
      <div
        className="transition-transform duration-300"
        style={{
          backgroundImage: `url(${getPlantAssetPath(plantType, "seed")})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: `-${currentFrame * config.spriteWidth}px 0px`,
          backgroundSize: `${config.frames * config.spriteWidth}px ${
            config.spriteHeight
          }px`,
          width: config.spriteWidth,
          height: config.spriteHeight,
          transform: `scale(${scaleFactor})`,
          transformOrigin: "top left",
        }}
      />

      {/* Progress bar */}
      <div className="absolute -bottom-1 left-0 w-full h-1 bg-gray-600 rounded">
        <div
          className="h-full bg-green-400 rounded transition-all duration-1000"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
