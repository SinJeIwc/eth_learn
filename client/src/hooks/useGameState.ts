import { useState, useEffect } from "react";
import { InventoryItem, PlantedCrop, ShopItem, INITIAL_INVENTORY, MOCK_SHOP_DATA } from "../types/farm";

interface GameState {
  coins: number;
  inventory: InventoryItem[];
  plantedCrops: PlantedCrop[];
  shopItems: ShopItem[];
}

const DEFAULT_GAME_STATE: GameState = {
  coins: 100,
  inventory: INITIAL_INVENTORY,
  plantedCrops: [],
  shopItems: MOCK_SHOP_DATA
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Инициализация с загрузкой из localStorage
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('farm_game_state');
      if (savedState) {
        try {
          return JSON.parse(savedState);
        } catch (error) {
          console.error('Ошибка загрузки сохранения:', error);
        }
      }
    }
    return DEFAULT_GAME_STATE;
  });

  // Сохранение состояния в localStorage при изменении
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('farm_game_state', JSON.stringify(gameState));
    }
  }, [gameState]);

  const updateCoins = (newCoins: number) => {
    setGameState(prev => ({ ...prev, coins: newCoins }));
  };

  const updateInventory = (newInventory: InventoryItem[]) => {
    setGameState(prev => ({ ...prev, inventory: newInventory }));
  };

  const updatePlantedCrops = (newCrops: PlantedCrop[]) => {
    setGameState(prev => ({ ...prev, plantedCrops: newCrops }));
  };

  const updateShopItems = (newShopItems: ShopItem[]) => {
    setGameState(prev => ({ ...prev, shopItems: newShopItems }));
  };

  const resetGame = () => {
    setGameState(DEFAULT_GAME_STATE);
    localStorage.removeItem('farm_game_state');
  };

  return {
    ...gameState,
    updateCoins,
    updateInventory,
    updatePlantedCrops,
    updateShopItems,
    resetGame
  };
};