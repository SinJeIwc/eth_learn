"use client";

import { useState } from "react";
import Image from "next/image";
import FarmGrid from "./FarmGrid";
import InventoryModal from "./InventoryModal";
import ShopModal from "./ShopModal";
import { useFarmLogic } from "@/hooks/useFarmLogic";
import { UserData } from "@/lib/auth";
import { UI_PATHS } from "@/lib/constants";

interface FarmGameProps {
  onExit?: () => void;
  userData?: UserData;
}

export default function FarmGame({ onExit, userData }: FarmGameProps) {
  const {
    coins,
    inventory,
    plantedCrops,
    shopItems,
    selectedSeed,
    isLoading,
    plantSeed,
    plantOnCell,
    harvestCrop,
    sellCrop,
    buyItem,
  } = useFarmLogic();

  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
        <div className="bg-black bg-opacity-70 p-8 rounded-lg text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl font-pixelify-sans">Loading farm data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
      <header className="flex justify-between items-center mb-4 bg-black/60 bg-opacity-70 p-4 rounded-lg">
        <div className="text-yellow-400 font-pixelify-sans text-xl flex items-center gap-1">
          <Image src="/money.png" alt="Money" width={24} height={24} className="inline" /> {coins}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsInventoryOpen(true)}
            className="scale-90 hover:scale-100 transition-transform duration-200"
            aria-label="Open backpack"
          >
            <Image src={UI_PATHS.BACKPACK} alt="Backpack" width={64} height={64} className="object-contain" />
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

      {/* Farm Grid */}
      <FarmGrid
        plantedCrops={plantedCrops}
        selectedSeed={!!selectedSeed}
        onCellClick={plantOnCell}
        onHarvest={harvestCrop}
      />

      {/* Modals */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        onPlantSeed={plantSeed}
        onSellCrop={sellCrop}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        shopItems={shopItems}
        onBuyItem={buyItem}
        coins={coins}
      />
    </div>
  );
}
