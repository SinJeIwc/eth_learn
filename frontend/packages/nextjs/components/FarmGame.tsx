"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import EventNotification from "./EventNotification";
import FarmGrid from "./FarmGrid";
import InventoryModal from "./InventoryModal";
import ShopModal from "./ShopModal";
import { UI_PATHS } from "@/lib/constants";
import { Item, PlantedCrop } from "@/types/farm";
import { useAccount } from "wagmi";
import { useFarmContracts } from "~~/hooks/useFarmContracts";
import { useInventory } from "~~/hooks/useInventory";
import { useInventoryActions } from "~~/hooks/useInventoryActions";
import { usePlayerInit } from "~~/hooks/usePlayerInit";
import { useShopActions } from "~~/hooks/useShopActions";
import { useShopData } from "~~/hooks/useShopData";
import { useInventoryStore } from "~~/stores/inventoryStore";
import { usePlantStore } from "~~/stores/plantStore";

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

  // Автоматическая проверка и триггер событий каждый час

  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [plantedCrops, setPlantedCrops] = useState<PlantedCrop[]>([]);
  const [isPlanting, setIsPlanting] = useState(false);
  const [plantingProgress, setPlantingProgress] = useState({ current: 0, total: 0 });

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
    console.log(`🌱 Auto-planting ${quantity} ${item.name}...`);

    setIsPlanting(true);
    setPlantingProgress({ current: 0, total: quantity });

    // Находим все свободные клетки
    const gridSize = 5; // 5x5 grid
    const freeCells: { x: number; y: number }[] = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const occupied = plantedSeeds.some(seed => seed.x === x && seed.y === y);
        if (!occupied) {
          freeCells.push({ x, y });
        }
      }
    }

    // Проверяем, достаточно ли свободных клеток
    if (freeCells.length < quantity) {
      alert(`❌ Not enough free cells! Available: ${freeCells.length}, Need: ${quantity}`);
      setIsPlanting(false);
      return;
    }

    // Сажаем семена на первые свободные клетки
    let successCount = 0;
    for (let i = 0; i < quantity; i++) {
      const cell = freeCells[i];
      setPlantingProgress({ current: i + 1, total: quantity });

      const success = await handlePlantSeed(item, 1, cell.x, cell.y);
      if (success) {
        successCount++;
        // Небольшая задержка между посадками (2 секунды - защита от nonce)
        if (i < quantity - 1) {
          await new Promise(resolve => setTimeout(resolve, 2100));
        }
      } else {
        console.log(`⚠️ Failed to plant seed at (${cell.x}, ${cell.y})`);
      }
    }

    console.log(`✅ Successfully planted ${successCount}/${quantity} seeds`);

    setIsPlanting(false);
    setPlantingProgress({ current: 0, total: 0 });

    if (successCount > 0) {
      alert(`✅ Successfully planted ${successCount}/${quantity} ${item.name}!`);
    } else {
      alert(`❌ Failed to plant seeds. Please try again.`);
    }

    setIsInventoryOpen(false);
  };

  const handleCellClick = async (x: number, y: number) => {
    // Клик по клетке теперь используется только для сбора урожая
    console.log(`Clicked cell (${x}, ${y})`);
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
          sellPrice: cropInfo.sellPrice,
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

  const onBuyItem = (item: Item, quantity: number = 1) => {
    const seedTypeMap: Record<string, string> = {
      wheat_seed: "wheat",
      grape_seed: "grape",
      pumpkin_seed: "pumpkin",
    };
    const seedType = seedTypeMap[item.id];
    if (seedType) {
      handleBuySeeds(seedType, quantity);
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
            <Image src="/backpack.png" alt="Inventory" width={64} height={64} className="object-contain" />
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

      {/* Индикатор прогресса посадки */}
      {isPlanting && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 bg-opacity-95 px-8 py-4 rounded-lg shadow-2xl border-2 border-green-400">
          <div className="text-white font-pixelify-sans text-center">
            <div className="text-xl font-bold mb-2">🌱 Planting Seeds...</div>
            <div className="text-lg mb-3">
              {plantingProgress.current} / {plantingProgress.total}
            </div>
            <div className="w-64 h-4 bg-green-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${(plantingProgress.current / plantingProgress.total) * 100}%` }}
              />
            </div>
            <div className="text-sm mt-2 text-yellow-200">Please wait, planting in progress...</div>
          </div>
        </div>
      )}

      <FarmGrid
        plantedCrops={plantedCrops}
        selectedSeed={false}
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
