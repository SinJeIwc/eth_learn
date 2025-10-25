import { useState, useEffect } from "react";
import { Item, PlantedCrop } from "@/types/api";
import { useGameState } from "./useGameState";
import { isCropReady } from "@/lib/utils";

// Crop items mapping (seeds to crops)
const CROP_MAPPING: Record<string, string> = {
  seed_wheat: "fetus_wheat",
  seed_grape: "fetus_grape",
  seed_pumpkin: "fetus_pumpkin",
};

/**
 * Custom hook for farm game logic
 */
export function useFarmLogic() {
  const {
    coins,
    inventory,
    plantedCrops,
    shopItems,
    isLoading,
    updateCoins,
    updateInventory,
    updatePlantedCrops,
    updateShopItems,
  } = useGameState();

  const [selectedSeed, setSelectedSeed] = useState<Item | null>(null);

  // Update crop growth status
  useEffect(() => {
    const interval = setInterval(() => {
      updatePlantedCrops(
        plantedCrops.map((crop) => ({
          ...crop,
          isReady: isCropReady(crop.plantedAt, crop.item.growthTime),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [plantedCrops, updatePlantedCrops]);

  const plantSeed = (seed: Item, quantity: number) => {
    setSelectedSeed(seed);

    // Remove seeds from inventory
    const updatedInventory = inventory
      .map((invItem) =>
        invItem.item.id === seed.id
          ? { ...invItem, quantity: invItem.quantity - quantity }
          : invItem
      )
      .filter((invItem) => invItem.quantity > 0);

    updateInventory(updatedInventory);
  };

  const plantOnCell = (x: number, y: number) => {
    if (!selectedSeed) return;

    // Check if cell is occupied
    const existingCrop = plantedCrops.find(
      (crop) => crop.x === x && crop.y === y
    );
    if (existingCrop) return;

    // Plant the crop
    const newCrop: PlantedCrop = {
      id: `${x}-${y}-${Date.now()}`,
      item: selectedSeed,
      x,
      y,
      plantedAt: Date.now(),
      isReady: false,
    };

    updatePlantedCrops([...plantedCrops, newCrop]);
    setSelectedSeed(null);
  };

  const harvestCrop = (crop: PlantedCrop) => {
    // Remove crop from field
    const updatedCrops = plantedCrops.filter((c) => c.id !== crop.id);
    updatePlantedCrops(updatedCrops);

    // Get the crop item ID from the seed
    const cropItemId = CROP_MAPPING[crop.item.id];
    if (!cropItemId) return;

    // Check if we already have this crop type in inventory
    const existingItem = inventory.find(
      (invItem) => invItem.item.id === cropItemId
    );

    if (existingItem) {
      // Increase quantity of existing crop
      const updatedInventory = inventory.map((invItem) =>
        invItem.item.id === cropItemId
          ? { ...invItem, quantity: invItem.quantity + 1 }
          : invItem
      );
      updateInventory(updatedInventory);
    } else {
      // Create new crop item (we need to construct it from seed data)
      const plantType = cropItemId.replace("fetus_", "");
      const sellPrice =
        {
          fetus_wheat: 15,
          fetus_grape: 30,
          fetus_pumpkin: 40,
        }[cropItemId as string] || 10;

      const newCropItem: Item = {
        id: cropItemId,
        name: crop.item.name.replace(" Seeds", ""),
        type: "crop",
        description: `Freshly harvested ${plantType}.`,
        price: 0,
        sellPrice,
        growthTime: 0,
        icon: crop.item.icon.replace("/seed.png", "/fetus.png"),
      };

      updateInventory([...inventory, { item: newCropItem, quantity: 1 }]);
    }
  };

  const sellCrop = (crop: Item, quantity: number) => {
    if (!crop.sellPrice) return;

    // Add coins
    updateCoins(coins + crop.sellPrice * quantity);

    // Remove from inventory
    const updatedInventory = inventory
      .map((invItem) =>
        invItem.item.id === crop.id
          ? { ...invItem, quantity: invItem.quantity - quantity }
          : invItem
      )
      .filter((invItem) => invItem.quantity > 0);

    updateInventory(updatedInventory);
  };

  const buyItem = (item: Item, quantity: number) => {
    const totalCost = item.price * quantity;
    if (coins < totalCost) return;

    // Spend coins
    updateCoins(coins - totalCost);

    // Add to inventory
    const existingItem = inventory.find(
      (invItem) => invItem.item.id === item.id
    );

    const updatedInventory = existingItem
      ? inventory.map((invItem) =>
          invItem.item.id === item.id
            ? { ...invItem, quantity: invItem.quantity + quantity }
            : invItem
        )
      : [...inventory, { item, quantity }];

    updateInventory(updatedInventory);

    // Update shop stock
    const updatedShopItems = shopItems.map((shopItem) =>
      shopItem.item.id === item.id
        ? {
            ...shopItem,
            stock: shopItem.stock - quantity,
            available: shopItem.stock - quantity > 0,
          }
        : shopItem
    );

    updateShopItems(updatedShopItems);
  };

  return {
    // State
    coins,
    inventory,
    plantedCrops,
    shopItems,
    selectedSeed,
    isLoading,

    // Actions
    plantSeed,
    plantOnCell,
    harvestCrop,
    sellCrop,
    buyItem,
    clearSelectedSeed: () => setSelectedSeed(null),
  };
}
