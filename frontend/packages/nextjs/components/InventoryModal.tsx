"use client";

import { useState } from "react";
import Image from "next/image";
import SafeImage from "./SafeImage";
import { UI_PATHS } from "@/lib/constants";
import { InventoryItem, Item } from "@/types/farm";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onPlantSeed: (item: Item, quantity: number) => void;
  onSellCrop: (item: Item, quantity: number) => void;
}

export default function InventoryModal({ isOpen, onClose, inventory, onPlantSeed, onSellCrop }: InventoryModalProps) {
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
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl mx-4">
        <div className="relative p-8 rounded-lg ring-2 ring-blue-700/50 shadow-xl">
          <div className="absolute inset-0 rounded-lg bg-black/45" />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white font-pixelify-sans">BACKPACK</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 grid place-items-center hover:opacity-75 transition-opacity"
                aria-label="Close"
              >
                <Image src={UI_PATHS.CLOSE} alt="Close" width={32} height={32} className="object-contain" />
              </button>
            </div>
            {/* Inventory Items */}
            <div className="grid grid-cols-1 gap-3 mb-6 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
              {inventory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">📦</div>
                  <p className="text-gray-300 font-pixelify-sans">Your backpack is empty</p>
                </div>
              ) : (
                inventory.map((invItem, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded border-2 transition-colors ${
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
                    <div className="flex items-center gap-4">
                      <SafeImage
                        src={invItem.item.icon}
                        alt={invItem.item.name}
                        width={80}
                        height={80}
                        className="object-contain"
                        fallbackText="🌱"
                      />
                      <div className="flex-1">
                        <div className="text-white font-bold text-lg font-pixelify-sans">{invItem.item.name}</div>
                        <div className="text-gray-200 text-base">
                          {invItem.item.type === "seed" ? "🌱 Seed" : "🌾 Crop"}
                        </div>
                        <div className="text-gray-200 text-base">Quantity: {invItem.quantity}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Item Details */}
            {selectedItem && (
              <div className="bg-black/30 p-5 rounded mb-2">
                <h3 className="text-white font-bold text-xl mb-3 font-pixelify-sans">{selectedItem.item.name}</h3>
                <p className="text-gray-100/90 text-base mb-4">{selectedItem.item.description}</p>

                <div className="mb-4">
                  <label className="text-white text-base block mb-2">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.quantity}
                    value={quantity}
                    onChange={e => handleSliderChange(parseInt(e.target.value))}
                    className="w-full p-3 rounded text-lg bg-black/40 text-white outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div className="flex gap-3">
                  {selectedItem.item.type === "seed" && (
                    <button
                      onClick={() => handleAction("plant")}
                      className="flex-1 rounded px-6 py-3 text-lg font-pixelify-sans text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      PLANT
                    </button>
                  )}
                  {selectedItem.item.type === "crop" && selectedItem.item.sellPrice && (
                    <button
                      onClick={() => handleAction("sell")}
                      className="flex-1 rounded px-6 py-3 text-lg font-pixelify-sans text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
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
