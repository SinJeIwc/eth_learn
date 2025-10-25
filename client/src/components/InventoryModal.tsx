"use client";

import { useState } from "react";
import Image from "next/image";
import SafeImage from "./SafeImage";
import { Item, InventoryItem } from "@/types/farm";
import { UI_PATHS } from "@/lib/constants";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onPlantSeed: (item: Item, quantity: number) => void;
  onSellCrop: (item: Item, quantity: number) => void;
  coins: number;
}

export default function InventoryModal({
  isOpen,
  onClose,
  inventory,
  onPlantSeed,
  onSellCrop,
  coins,
}: InventoryModalProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleQuantityChange = (value: string) => {
    if (!selectedItem) return;
    const numValue = parseInt(value) || 1;
    setQuantity(Math.min(Math.max(1, numValue), selectedItem.quantity));
  };

  const handleAction = (action: "plant" | "sell") => {
    if (!selectedItem) return;

    if (action === "plant") {
      onPlantSeed(selectedItem.item, quantity);
    } else {
      onSellCrop(selectedItem.item, quantity);
    }

    setSelectedItem(null);
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 bg-opacity-75 bg-[url('/UI/inventory_bg.png')] flex items-center justify-center z-50">
      <div className="relative max-w-md w-full mx-4 p-6 rounded-lg  bg-cover bg-center">
        <div className="absolute inset-0 bg-opacity-60 rounded-lg" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white font-pixelify-sans">
              BACKPACK
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center"
            >
              <Image
                src={UI_PATHS.CLOSE}
                alt="Close"
                width={24}
                height={24}
                className="object-contain hover:opacity-70 transition-opacity"
              />
            </button>
          </div>

          {/* Coins */}
          <div className="mb-4 text-yellow-400 font-pixelify-sans">
            💰 Coins: {coins}
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4 max-h-64 overflow-y-auto">
            {inventory.map((invItem, index) => (
              <div
                key={index}
                className={`p-3 bg-gray-700 rounded cursor-pointer border-2 transition-colors ${
                  selectedItem?.item.id === invItem.item.id
                    ? "border-orange-500"
                    : "border-transparent hover:border-gray-500"
                }`}
                onClick={() => setSelectedItem(invItem)}
              >
                <div className="flex items-center justify-center mb-2">
                  <SafeImage
                    src={invItem.item.icon}
                    alt={invItem.item.name}
                    width={40}
                    height={40}
                    className="object-contain"
                    fallbackText="🌱"
                  />
                </div>
                <div className="text-white text-sm font-pixelify-sans text-center">
                  {invItem.item.name}
                </div>
                <div className="text-gray-300 text-xs text-center">
                  x{invItem.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Item Details */}
          {selectedItem && (
            <div className="bg-gray-700 p-4 rounded mb-4">
              <h3 className="text-white font-bold mb-2 font-pixelify-sans">
                {selectedItem.item.name}
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                {selectedItem.item.description}
              </p>

              <div className="mb-3">
                <label className="text-white text-sm block mb-1">
                  Quantity:
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.quantity}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full p-2 bg-gray-600 text-white rounded"
                />
              </div>

              <div className="flex gap-2">
                {selectedItem.item.type === "seed" && (
                  <button
                    onClick={() => handleAction("plant")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-pixelify-sans"
                  >
                    PLANT
                  </button>
                )}
                {selectedItem.item.type === "crop" &&
                  selectedItem.item.sellPrice && (
                    <button
                      onClick={() => handleAction("sell")}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-pixelify-sans"
                    >
                      SELL (+{selectedItem.item.sellPrice * quantity}💰)
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
