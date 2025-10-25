import { PlantType } from "./constants";
import { PLANT_TYPES } from "@/types/api";

/**
 * Validates if a string is a valid URL or path
 */
export function isValidImagePath(path: string): boolean {
  if (!path || typeof path !== "string") return false;

  // Valid relative path
  if (path.startsWith("/")) return true;

  // Try to construct absolute URL
  try {
    new URL(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the plant asset path
 */
export function getPlantAssetPath(
  plantType: PlantType,
  assetType: "seed" | "fetus"
): string {
  return `/Plants/${plantType}/${assetType}.png`;
}

/**
 * Converts seed ID to plant type
 */
export function seedIdToPlantType(seedId: string): PlantType {
  // seed_wheat -> wheat, fetus_wheat -> wheat
  const mapped = PLANT_TYPES[seedId as keyof typeof PLANT_TYPES];
  return (mapped || "wheat") as PlantType;
}

/**
 * Calculates growth progress (0-1)
 */
export function calculateGrowthProgress(
  plantedAt: number,
  growthTime: number
): number {
  const elapsed = Date.now() - plantedAt;
  const progress = elapsed / (growthTime * 1000);
  return Math.min(progress, 1);
}

/**
 * Checks if a crop is ready for harvest
 */
export function isCropReady(plantedAt: number, growthTime: number): boolean {
  return Date.now() - plantedAt >= growthTime * 1000;
}

/**
 * Formats number with fallback
 */
export function formatNumber(value: number | undefined, fallback = 0): number {
  return typeof value === "number" && !isNaN(value) ? value : fallback;
}
