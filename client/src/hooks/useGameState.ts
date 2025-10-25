import { useState, useEffect } from "react";
import { InventoryItem, PlantedCrop, ShopItem } from "@/types/api";
import {
  fetchInventory,
  fetchShop,
  convertInventoryResponse,
  convertShopResponse,
  saveInventoryToStorage,
  saveShopToStorage,
} from "@/services/api";

interface GameState {
  coins: number;
  inventory: InventoryItem[];
  plantedCrops: PlantedCrop[];
  shopItems: ShopItem[];
  isLoading: boolean;
}

const DEFAULT_GAME_STATE: GameState = {
  coins: 100,
  inventory: [],
  plantedCrops: [],
  shopItems: [],
  isLoading: true,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);

  // Load initial data from API (JSON files)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from localStorage first
        const savedState = localStorage.getItem("farm_game_state");
        const savedInventory = localStorage.getItem("inventory");
        const savedShop = localStorage.getItem("shop");

        if (savedState && savedInventory && savedShop) {
          // Load from localStorage
          const parsedState = JSON.parse(savedState);
          const inventoryData = convertInventoryResponse(
            JSON.parse(savedInventory)
          );
          const shopData = convertShopResponse(JSON.parse(savedShop));

          setGameState({
            ...parsedState,
            inventory: inventoryData,
            shopItems: shopData,
            isLoading: false,
          });
        } else {
          // Load from API (JSON files)
          const [inventoryResponse, shopResponse] = await Promise.all([
            fetchInventory(),
            fetchShop(),
          ]);

          const inventory = convertInventoryResponse(inventoryResponse);
          const shopItems = convertShopResponse(shopResponse);

          // Save to localStorage
          saveInventoryToStorage(inventory);
          saveShopToStorage(shopItems);
          localStorage.setItem(
            "farm_game_state",
            JSON.stringify({
              coins: 100,
              plantedCrops: [],
            })
          );

          setGameState({
            coins: 100,
            inventory,
            plantedCrops: [],
            shopItems,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Failed to load game data:", error);
        setGameState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadData();
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (!gameState.isLoading && typeof window !== "undefined") {
      localStorage.setItem(
        "farm_game_state",
        JSON.stringify({
          coins: gameState.coins,
          plantedCrops: gameState.plantedCrops,
        })
      );
      saveInventoryToStorage(gameState.inventory);
      saveShopToStorage(gameState.shopItems);
    }
  }, [gameState]);

  const updateCoins = (newCoins: number) => {
    setGameState((prev) => ({ ...prev, coins: newCoins }));
  };

  const updateInventory = (newInventory: InventoryItem[]) => {
    setGameState((prev) => ({ ...prev, inventory: newInventory }));
  };

  const updatePlantedCrops = (newCrops: PlantedCrop[]) => {
    setGameState((prev) => ({ ...prev, plantedCrops: newCrops }));
  };

  const updateShopItems = (newShopItems: ShopItem[]) => {
    setGameState((prev) => ({ ...prev, shopItems: newShopItems }));
  };

  const resetGame = async () => {
    try {
      const [inventoryResponse, shopResponse] = await Promise.all([
        fetchInventory(),
        fetchShop(),
      ]);

      const inventory = convertInventoryResponse(inventoryResponse);
      const shopItems = convertShopResponse(shopResponse);

      setGameState({
        coins: 100,
        inventory,
        plantedCrops: [],
        shopItems,
        isLoading: false,
      });

      localStorage.removeItem("farm_game_state");
      localStorage.removeItem("inventory");
      localStorage.removeItem("shop");
    } catch (error) {
      console.error("Failed to reset game:", error);
    }
  };

  return {
    ...gameState,
    updateCoins,
    updateInventory,
    updatePlantedCrops,
    updateShopItems,
    resetGame,
  };
};
