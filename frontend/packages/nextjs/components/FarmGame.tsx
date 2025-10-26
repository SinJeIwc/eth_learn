"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import EventNotification from "./EventNotification";
import FarmGrid from "./FarmGrid";
import InventoryModal from "./InventoryModal";
import ShopModal from "./ShopModal";
import { UI_PATHS } from "@/lib/constants";
import { Item, PlantedCrop } from "@/types/farm";
import { useAccount } from "wagmi";
import { useFarmContracts } from "~~/hooks/useFarmContracts";
import { useHourlyEventTrigger } from "~~/hooks/useHourlyEventTrigger";
import { useInventory } from "~~/hooks/useInventory";
import { useInventoryActions } from "~~/hooks/useInventoryActions";
import { usePlayerInit } from "~~/hooks/usePlayerInit";
import { useShopActions } from "~~/hooks/useShopActions";
import { useShopData } from "~~/hooks/useShopData";
import { usePlantStore } from "~~/stores/plantStore";
import { useInventoryStore } from "~~/stores/inventoryStore";
import { CROP_ITEMS } from "~~/types/farm";

interface FarmGameProps {
  onExit?: () => void;
}

export default function FarmGame({ onExit }: FarmGameProps) {
  const { isConnected } = useAccount();
  const { isInitializing, coinBalance: blockchainCoins, isLoading: isLoadingBalance } = usePlayerInit();
  const { plantBalance, cropBalance } = useFarmContracts();
  const inventory = useInventory();

  const { boughtSeeds, handleBuySeeds } = useShopActions();
  const { handlePlantSeed, handleSellCrop } = useInventoryActions();
  const { shopItems } = useShopData(boughtSeeds);
  
  const { plantedSeeds, removePlantedSeed } = usePlantStore();
  const { addItem } = useInventoryStore();
  const [selectedSeedItem, setSelectedSeedItem] = useState<Item | null>(null);

  // Автоматическая проверка и триггер событий каждый час
  const { isChecking: isCheckingEvent } = useHourlyEventTrigger();

  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [plantedCrops, setPlantedCrops] = useState<PlantedCrop[]>([]);

  const displayCoins = isConnected ? blockchainCoins : 0;

  // Обновляем plantedCrops из plantStore каждую секунду для обновления прогресса
  useEffect(() => {
    const updateCrops = () => {
      const crops: PlantedCrop[] = plantedSeeds.map(seed => {
        const now = Date.now();
        const elapsed = now - seed.plantedAt;
        const isReady = elapsed >= seed.growthTime;

        return {
          id: seed.id,
          x: seed.x,
          y: seed.y,
          plantedAt: seed.plantedAt,
          isReady,
          item: {
            id: seed.seedType,
            name: seed.seedType.replace("_seed", "").toUpperCase(),
            type: "seed" as const,
            description: "",
            price: 0,
            sellPrice: 0,
            growthTime: seed.growthTime,
            icon: `/Plants/${seed.seedType.replace("_seed", "")}/seed.png`,
          },
        };
      });
      
      setPlantedCrops(crops);
    };

    updateCrops();
    const interval = setInterval(updateCrops, 1000);
    return () => clearInterval(interval);
  }, [plantedSeeds]);

  const onPlantSeed = async (item: Item, quantity: number) => {
    // Устанавливаем выбранное семя для посадки
    setSelectedSeedItem(item);
    setIsInventoryOpen(false);
    console.log("Selected seed for planting:", item.name);
  };

  const handleCellClick = async (x: number, y: number) => {
    if (!selectedSeedItem) {
      console.log("No seed selected");
      return;
    }

    const success = await handlePlantSeed(selectedSeedItem, 1, x, y);
    if (success) {
      setSelectedSeedItem(null); // Сбрасываем выбор после посадки
    }
  };

  const handleHarvest = (crop: PlantedCrop) => {
    if (!crop.isReady) {
      console.log("Crop not ready yet");
      return;
    }

    console.log("Harvesting crop:", crop);
    
    // Определяем тип плода и его цену
    const cropTypeMap: Record<string, { id: string; name: string; sellPrice: number; icon: string }> = {
      wheat_seed: { id: "wheat", name: "Wheat", sellPrice: 15, icon: "/Plants/wheat/fetus.png" },
      grape_seed: { id: "grape", name: "Grapes", sellPrice: 30, icon: "/Plants/grape/fetus.png" },
      pumpkin_seed: { id: "pumpkin", name: "Pumpkin", sellPrice: 40, icon: "/Plants/pumpkin/fetus.png" },
    };

    const cropInfo = cropTypeMap[crop.item.id];
    if (cropInfo) {
      // Добавляем собранный плод в инвентарь
      addItem(
        {
          id: cropInfo.id,
          name: cropInfo.name,
          type: "crop",
          description: `Harvested ${cropInfo.name}`,
          price: 0,
          sellPrice: cropInfo.sellPrice,
          growthTime: 0,
          icon: cropInfo.icon,
        },
        1,
      );
      console.log(`✅ Harvested ${cropInfo.name}! Added to inventory with sell price: ${cropInfo.sellPrice}`);
    }
    
    // Удаляем растение с поля
    removePlantedSeed(crop.id);
  };

  const onSellCrop = async (item: Item, quantity: number) => {
    const success = await handleSellCrop(item, quantity);
    if (success) setIsInventoryOpen(false);
  };

  const onBuyItem = (item: Item) => {
    const seedTypeMap: Record<string, string> = {
      wheat_seed: "wheat",
      grape_seed: "grape",
      pumpkin_seed: "pumpkin",
    };
    const seedType = seedTypeMap[item.id];
    if (seedType) {
      handleBuySeeds(seedType);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
        <div className="bg-black bg-opacity-70 p-8 rounded-lg text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl font-pixelify-sans">Initializing player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
      {/* Event Notification */}
      <EventNotification />

      {/* Удалены всплывающие баннеры с рекламой faucet */}

      <header className="flex justify-between items-center mb-4 bg-black/60 bg-opacity-70 p-4 rounded-lg">
        <div className="flex flex-col gap-1">
          <div className="text-yellow-400 font-pixelify-sans text-3xl flex items-center gap-1">
            <Image src="/money.png" alt="Money" width={50} height={50} className="inline" />
            {isLoadingBalance ? <span className="animate-pulse">...</span> : <span>{Math.floor(displayCoins)}</span>}
          </div>
          {isConnected && (
            <div className="text-xs text-gray-300 flex gap-3">
              <span title="Plants (NFT)">🌱 {plantBalance}</span>
              <span title="Harvested crops">🌾 {cropBalance}</span>
              <span className="text-green-400">⛓️ Blockchain</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsInventoryOpen(true)}
            className="scale-90 hover:scale-110 transition-transform duration-200"
            aria-label="Open inventory"
          >
            <Image src="/UI/inventory.png" alt="Inventory" width={64} height={64} className="object-contain" />
          </button>

          <button
            onClick={() => setIsShopOpen(true)}
            className="scale-90 hover:scale-110 transition-transform duration-200"
            aria-label="Open shop"
          >
            <Image src="/UI/market.png" alt="Shop" width={64} height={64} className="object-contain" />
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="scale-90 hover:scale-100 transition-transform duration-200"
              aria-label="Exit game"
            >
              <Image src={UI_PATHS.LOGOUT} alt="Exit" width={128} height={32} className="object-contain" />
            </button>
          )}
        </div>
      </header>

      {/* Индикатор выбранного семени */}
      {selectedSeedItem && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-40 bg-green-600 bg-opacity-90 px-6 py-3 rounded-lg shadow-xl animate-bounce">
          <div className="text-white font-pixelify-sans text-center">
            <div className="text-lg font-bold">🌱 {selectedSeedItem.name} selected</div>
            <div className="text-sm">Click on an empty cell to plant!</div>
            <button
              onClick={() => setSelectedSeedItem(null)}
              className="mt-2 text-xs underline hover:text-yellow-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <FarmGrid
        plantedCrops={plantedCrops}
        selectedSeed={selectedSeedItem !== null}
        onCellClick={handleCellClick}
        onHarvest={handleHarvest}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        shopItems={shopItems}
        onBuyItem={onBuyItem}
        coins={displayCoins}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        onPlantSeed={onPlantSeed}
        onSellCrop={onSellCrop}
      />
    </div>
  );
}
