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
}

export default function InventoryModal({
  isOpen,
  onClose,
  inventory,
  onPlantSeed,
  onSellCrop,
}: InventoryModalProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleSliderChange = (value: number) => {
    if (!selectedItem) return;
    setQuantity(Math.min(Math.max(1, value), selectedItem.quantity));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* затемнённый backdrop */}
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      {/* карточка инвентаря */}
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div className="relative p-6 rounded-lg ring-2 ring-blue-700/50 shadow-xl">
          {/* лёгкий тёмный фильтр поверх картинки, чтобы текст читался */}
          <div className="absolute inset-0 rounded-lg bg-black/45" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white font-pixelify-sans">
                BACKPACK
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 grid place-items-center hover:opacity-75 transition-opacity"
                aria-label="Close"
              >
                <Image
                  src={UI_PATHS.CLOSE}
                  alt="Close"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </button>
            </div>
          {/* Inventory Items */}
          <div className="grid grid-cols-1 gap-2 mb-4 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">📦</div>
                <p className="text-gray-300 font-pixelify-sans">
                  Your backpack is empty
                </p>
              </div>
            ) : (
              inventory.map((invItem, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-2 transition-colors ${
                    selectedItem?.item.id === invItem.item.id
                      ? "bg-black/30 border-blue-500 cursor-pointer"
                      : "bg-black/25 border-transparent hover:border-white/30 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (selectedItem?.item.id === invItem.item.id) {
                      setSelectedItem(null);
                      setQuantity(1);
                    } else {
                      setSelectedItem(invItem);
                      setQuantity(1);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={invItem.item.icon}
                      alt={invItem.item.name}
                      width={40}
                      height={40}
                      className="object-contain"
                      fallbackText="🌱"
                    />
                    <div className="flex-1">
                      <div className="text-white font-bold font-pixelify-sans">
                        {invItem.item.name}
                      </div>
                      <div className="text-gray-200 text-xs">
                        {invItem.item.type === "seed" ? "🌱 Seed" : "🌾 Crop"}
                      </div>
                      <div className="text-gray-200 text-xs">
                        Quantity: {invItem.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Item Details */}
          {selectedItem && (
            <div className="bg-black/30 p-4 rounded mb-2">
              <h3 className="text-white font-bold mb-2 font-pixelify-sans">
                {selectedItem.item.name}
              </h3>
              <p className="text-gray-100/90 text-sm mb-3">
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
                  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                  className="w-full p-2 rounded bg-black/40 text-white outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex gap-2">
                {selectedItem.item.type === "seed" && (
                  <button
                    onClick={() => handleAction("plant")}
                    className="flex-1 rounded px-4 py-2 font-pixelify-sans text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    PLANT
                  </button>
                )}
                {selectedItem.item.type === "crop" &&
                  selectedItem.item.sellPrice && (
                    <button
                      onClick={() => handleAction("sell")}
                      className="flex-1 rounded px-4 py-2 font-pixelify-sans text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
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
    </div>
  );
}
