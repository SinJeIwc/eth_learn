import { useState, useEffect } from "react";
import { Item, PlantedCrop, CROP_ITEMS } from "@/types/farm";
import { useGameState } from "./useGameState";
import { isCropReady } from "@/lib/utils";

/**
 * Custom hook for farm game logic
 */
export function useFarmLogic() {
  const {
    coins,
    inventory,
    plantedCrops,
    shopItems,
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

    // Add harvested crop to inventory
    const cropItem = CROP_ITEMS.find(
      (item) => item.id === crop.item.id.replace("_seed", "")
    );

    if (!cropItem) return;

    const existingItem = inventory.find(
      (invItem) => invItem.item.id === cropItem.id
    );

    const updatedInventory = existingItem
      ? inventory.map((invItem) =>
          invItem.item.id === cropItem.id
            ? { ...invItem, quantity: invItem.quantity + 1 }
            : invItem
        )
      : [...inventory, { item: cropItem, quantity: 1 }];

    updateInventory(updatedInventory);
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

    // Actions
    plantSeed,
    plantOnCell,
    harvestCrop,
    sellCrop,
    buyItem,
    clearSelectedSeed: () => setSelectedSeed(null),
  };
}
