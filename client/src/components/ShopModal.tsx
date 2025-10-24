"use client";

import { useState } from "react";
import Image from "next/image";
import SafeImage from "./SafeImage";
import { Item, ShopItem } from "@/types/farm";
import { UI_PATHS } from "@/lib/constants";

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopItems: ShopItem[];
  onBuyItem: (item: Item, quantity: number) => void;
  coins: number;
}

export default function ShopModal({
  isOpen,
  onClose,
  shopItems,
  onBuyItem,
  coins,
}: ShopModalProps) {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleQuantityChange = (value: string) => {
    if (!selectedItem) return;
    const numValue = parseInt(value) || 1;
    const maxAffordable = Math.floor(coins / selectedItem.item.price);
    const maxQuantity = Math.min(selectedItem.stock, maxAffordable);
    setQuantity(Math.min(Math.max(1, numValue), maxQuantity));
  };

  const handleBuy = () => {
    if (!selectedItem) return;
    onBuyItem(selectedItem.item, quantity);
    setSelectedItem(null);
    setQuantity(1);
  };

  const canAfford = selectedItem
    ? coins >= selectedItem.item.price * quantity
    : false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div
        className="relative max-w-md w-full mx-4 p-6 rounded-lg"
        style={{
          backgroundImage: `url('${UI_PATHS.SHOP_BG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white font-pixelify-sans">
              SHOP
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

          {/* Shop Items */}
          <div className="grid grid-cols-1 gap-2 mb-4 max-h-64 overflow-y-auto">
            {shopItems.map((shopItem, index) => (
              <div
                key={index}
                className={`p-3 rounded border-2 transition-colors ${
                  !shopItem.available
                    ? "bg-gray-600 border-gray-500 opacity-50 cursor-not-allowed"
                    : selectedItem?.item.id === shopItem.item.id
                    ? "bg-gray-700 border-orange-500 cursor-pointer"
                    : "bg-gray-700 border-transparent hover:border-gray-500 cursor-pointer"
                }`}
                onClick={() => shopItem.available && setSelectedItem(shopItem)}
              >
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={shopItem.item.icon}
                    alt={shopItem.item.name}
                    width={40}
                    height={40}
                    className="object-contain"
                    fallbackText="🌱"
                  />
                  <div className="flex-1">
                    <div className="text-white font-bold font-pixelify-sans">
                      {shopItem.item.name}
                    </div>
                    <div className="text-yellow-400 text-sm">
                      💰 {shopItem.item.price}
                    </div>
                    <div className="text-gray-300 text-xs">
                      {shopItem.available
                        ? `Stock: ${shopItem.stock}`
                        : "Out of stock"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Item Details */}
          {selectedItem && selectedItem.available && (
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
                  max={Math.min(
                    selectedItem.stock,
                    Math.floor(coins / selectedItem.item.price)
                  )}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full p-2 bg-gray-600 text-white rounded"
                />
              </div>

              <button
                onClick={handleBuy}
                disabled={!canAfford}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-pixelify-sans transition-colors"
              >
                BUY (-{selectedItem.item.price * quantity}💰)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
