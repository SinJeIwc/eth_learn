"use client";

import { useState } from "react";
import Image from "next/image";
import SafeImage from "./SafeImage";
import { UI_PATHS } from "@/lib/constants";
import { Item, ShopItem } from "@/types/farm";

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopItems: ShopItem[];
  onBuyItem: (item: Item, quantity: number) => void;
  coins: number;
}

export default function ShopModal({ isOpen, onClose, shopItems, onBuyItem, coins }: ShopModalProps) {
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

  const canAfford = selectedItem ? coins >= selectedItem.item.price * quantity : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* затемнённый backdrop */}
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      {/* карточка магазина */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="relative p-8 rounded-lg ring-2 ring-purple-700/50 shadow-xl">
          {/* лёгкий тёмный фильтр поверх картинки, чтобы текст читался */}
          <div className="absolute inset-0 rounded-lg bg-black/45" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white font-pixelify-sans">SHOP</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 grid place-items-center hover:opacity-75 transition-opacity"
                aria-label="Close"
              >
                <Image src={UI_PATHS.CLOSE} alt="Close" width={32} height={32} className="object-contain" />
              </button>
            </div>
            {/* Shop Items */}
            <div className="grid grid-cols-1 gap-3 mb-6 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
              {shopItems.map((shopItem, index) => (
                <div
                  key={index}
                  className={`p-4 rounded border-2 transition-colors ${
                    !shopItem.available
                      ? "bg-gray-600/50 border-gray-500/50 opacity-50 cursor-not-allowed backdrop-blur-[1px]"
                      : selectedItem?.item.id === shopItem.item.id
                        ? "bg-black/30 border-purple-500 cursor-pointer backdrop-blur-[1px]"
                        : "bg-black/25 border-transparent hover:border-white/30 cursor-pointer backdrop-blur-[1px]"
                  }`}
                  onClick={() => shopItem.available && setSelectedItem(shopItem)}
                >
                  <div className="flex items-center gap-4">
                    <SafeImage
                      src={shopItem.item.icon}
                      alt={shopItem.item.name}
                      width={64}
                      height={64}
                      className="object-contain"
                      fallbackText="🌱"
                    />
                    <div className="flex-1">
                      <div className="text-white font-bold text-lg font-pixelify-sans">{shopItem.item.name}</div>
                      <div className="text-yellow-300 text-base">
                        <Image src="/money.png" alt="Money" width={20} height={20} className="inline" />
                        {shopItem.item.price}
                      </div>
                      <div className="text-gray-200 text-sm">
                        {shopItem.available ? `Stock: ${shopItem.stock}` : "Out of stock"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Item Details */}
            {selectedItem && selectedItem.available && (
              <div className="bg-black/30 backdrop-blur-[1px] p-5 rounded mb-2">
                <h3 className="text-white font-bold text-xl mb-3 font-pixelify-sans">{selectedItem.item.name}</h3>
                <p className="text-gray-100/90 text-base mb-4">{selectedItem.item.description}</p>

                <div className="mb-4">
                  <label className="text-white text-base block mb-2">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={Math.min(selectedItem.stock, Math.floor(coins / selectedItem.item.price))}
                    value={quantity}
                    onChange={e => handleQuantityChange(e.target.value)}
                    className="w-full p-3 rounded text-lg bg-black/40 text-white outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <button
                  onClick={handleBuy}
                  disabled={!canAfford}
                  className="w-full rounded px-6 py-3 text-lg font-pixelify-sans text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600/50 disabled:cursor-not-allowed transition-colors"
                >
                  BUY (-{selectedItem.item.price * quantity}💰)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
