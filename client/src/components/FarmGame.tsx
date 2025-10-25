"use client";

import { useState } from "react";
import Image from "next/image";
import SafeImage from "./SafeImage";
import InventoryModal from "./InventoryModal";
import ShopModal from "./ShopModal";
import FarmGrid from "./FarmGrid";
import { useFarmLogic } from "@/hooks/useFarmLogic";
import { UI_PATHS } from "@/lib/constants";

interface FarmGameProps {
  onExit?: () => void;
}

export default function FarmGame({ onExit }: FarmGameProps) {
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
    clearSelectedSeed,
  } = useFarmLogic();

  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

  // Show loading state
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
        <h1 className="text-2xl font-bold font-pixelify-sans">FARM</h1>

        <div className="flex items-center gap-4">
          <div className="text-yellow-400 font-pixelify-sans text-xl">
            💰 {coins}
          </div>

          <button
            onClick={() => setIsInventoryOpen(true)}
            className="scale-90 hover:scale-100 transition-transform duration-200"
            aria-label="Open backpack"
          >
            <Image
              src={UI_PATHS.BACKPACK}
              alt="Backpack"
              width={64}
              height={64}
              className="object-contain"
            />
          </button>

          <button
            onClick={() => setIsShopOpen(true)}
            className="scale-90 hover:scale-110 transition-transform duration-200"
            aria-label="Open shop"
          >
            <Image
              src={UI_PATHS.MARKET}
              alt="Shop"
              width={64}
              height={64}
              className="object-contain"
            />
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="scale-90 hover:scale-100 transition-transform duration-200"
              aria-label="Exit game"
            >
              <Image
                src={UI_PATHS.LOGOUT}
                alt="Exit"
                width={128}
                height={32}
                className="object-contain"
              />
            </button>
          )}
        </div>
      </header>

      {selectedSeed && (
        <div className="mb-4 p-3 bg-yellow-600 bg-opacity-90 rounded text-black font-pixelify-sans flex items-center gap-2">
          <SafeImage
            src={selectedSeed.icon}
            alt={selectedSeed.name}
            width={24}
            height={24}
            className="object-contain"
            fallbackText="🌱"
          />
          <span>
            Selected seeds: {selectedSeed.name}. Click on an empty cell to
            plant.
          </span>
          <button
            onClick={clearSelectedSeed}
            className="ml-auto px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
          >
            CANCEL
          </button>
        </div>
      )}

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
        coins={coins}
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
