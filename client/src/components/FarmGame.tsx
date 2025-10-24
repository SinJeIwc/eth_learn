"use client";

import { useState, useEffect } from "react";
import {
  InventoryItem,
  PlantedCrop,
  CROP_ITEMS,
  ShopItem,
  Item,
  FARM_GRID,
} from "../types/farm";
import { useGameState } from "../hooks/useGameState";

// Компоненты UI
const InventoryModal = ({
  isOpen,
  onClose,
  inventory,
  onPlantSeed,
  onSellCrop,
  coins,
}: {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onPlantSeed: (item: Item, quantity: number) => void;
  onSellCrop: (item: Item, quantity: number) => void;
  coins: number;
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white font-pixelify-sans">
            РЮКЗАК
          </h2>
          <button
            onClick={onClose}
            className="text-white text-2xl hover:text-red-400"
          >
            ×
          </button>
        </div>

        <div className="mb-4 text-yellow-400 font-pixelify-sans">
          💰 Монеты: {coins}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 max-h-64 overflow-y-auto">
          {inventory.map((invItem, index) => (
            <div
              key={index}
              className={`p-3 bg-gray-700 rounded cursor-pointer border-2 ${
                selectedItem?.item.id === invItem.item.id
                  ? "border-orange-500"
                  : "border-transparent"
              }`}
              onClick={() => setSelectedItem(invItem)}
            >
              <div className="text-2xl mb-1">{invItem.item.icon}</div>
              <div className="text-white text-sm font-pixelify-sans">
                {invItem.item.name}
              </div>
              <div className="text-gray-300 text-xs">x{invItem.quantity}</div>
            </div>
          ))}
        </div>

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
                Количество:
              </label>
              <input
                type="number"
                min="1"
                max={selectedItem.quantity}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(
                      parseInt(e.target.value) || 1,
                      selectedItem.quantity
                    )
                  )
                }
                className="w-full p-2 bg-gray-600 text-white rounded"
              />
            </div>

            <div className="flex gap-2">
              {selectedItem.item.type === "seed" && (
                <button
                  onClick={() => {
                    onPlantSeed(selectedItem.item, quantity);
                    onClose();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-pixelify-sans"
                >
                  ПОСАДИТЬ
                </button>
              )}

              {selectedItem.item.type === "crop" &&
                selectedItem.item.sellPrice && (
                  <button
                    onClick={() => {
                      onSellCrop(selectedItem.item, quantity);
                      onClose();
                    }}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-pixelify-sans"
                  >
                    ПРОДАТЬ (+{selectedItem.item.sellPrice * quantity}💰)
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ShopModal = ({
  isOpen,
  onClose,
  shopItems,
  onBuyItem,
  coins,
}: {
  isOpen: boolean;
  onClose: () => void;
  shopItems: ShopItem[];
  onBuyItem: (item: Item, quantity: number) => void;
  coins: number;
}) => {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white font-pixelify-sans">
            МАГАЗИН
          </h2>
          <button
            onClick={onClose}
            className="text-white text-2xl hover:text-red-400"
          >
            ×
          </button>
        </div>

        <div className="mb-4 text-yellow-400 font-pixelify-sans">
          💰 Монеты: {coins}
        </div>

        <div className="grid grid-cols-1 gap-2 mb-4 max-h-64 overflow-y-auto">
          {shopItems.map((shopItem, index) => (
            <div
              key={index}
              className={`p-3 rounded border-2 cursor-pointer ${
                !shopItem.available
                  ? "bg-gray-600 border-gray-500 opacity-50"
                  : selectedItem?.item.id === shopItem.item.id
                  ? "bg-gray-700 border-orange-500"
                  : "bg-gray-700 border-transparent"
              }`}
              onClick={() => shopItem.available && setSelectedItem(shopItem)}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{shopItem.item.icon}</div>
                <div className="flex-1">
                  <div className="text-white font-pixelify-sans">
                    {shopItem.item.name}
                  </div>
                  <div className="text-gray-300 text-sm">
                    💰 {shopItem.item.price}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {shopItem.available
                      ? `В наличии: ${shopItem.stock}`
                      : "Нет в наличии"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                Количество:
              </label>
              <input
                type="number"
                min="1"
                max={Math.min(
                  selectedItem.stock,
                  Math.floor(coins / selectedItem.item.price)
                )}
                value={quantity}
                onChange={(e) => {
                  const maxQuantity = Math.min(
                    selectedItem.stock,
                    Math.floor(coins / selectedItem.item.price)
                  );
                  setQuantity(
                    Math.min(parseInt(e.target.value) || 1, maxQuantity)
                  );
                }}
                className="w-full p-2 bg-gray-600 text-white rounded"
              />
            </div>

            <button
              onClick={() => {
                onBuyItem(selectedItem.item, quantity);
                onClose();
              }}
              disabled={coins < selectedItem.item.price * quantity}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-pixelify-sans"
            >
              КУПИТЬ (-{selectedItem.item.price * quantity}💰)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function FarmGame({ onExit }: { onExit?: () => void }) {
  const {
    coins,
    inventory,
    plantedCrops,
    shopItems,
    selectedSeed,
    plantSeed,
    plantOnCell,
    harvestCrop,
    sellCrop,
    buyItem,
    clearSelectedSeed,
  } = useFarmLogic();

  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<Item | null>(null);

  // Обновление роста растений
  useEffect(() => {
    const interval = setInterval(() => {
      updatePlantedCrops(
        plantedCrops.map((crop) => ({
          ...crop,
          isReady: Date.now() - crop.plantedAt >= crop.item.growthTime * 1000,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [plantedCrops, updatePlantedCrops]);

  const handlePlantSeed = (seed: Item, quantity: number) => {
    setSelectedSeed(seed);
    // Убираем семена из инвентаря
    updateInventory(
      inventory
        .map((invItem) =>
          invItem.item.id === seed.id
            ? { ...invItem, quantity: invItem.quantity - quantity }
            : invItem
        )
        .filter((invItem) => invItem.quantity > 0)
    );
  };

  const handleCellClick = (x: number, y: number) => {
    if (!selectedSeed) return;

    // Проверяем, что клетка свободна
    const existingCrop = plantedCrops.find(
      (crop) => crop.x === x && crop.y === y
    );
    if (existingCrop) return;

    // Сажаем растение
    const newCrop: PlantedCrop = {
      id: `${x}-${y}-${Date.now()}`,
      item: selectedSeed,
      x,
      y,
      plantedAt: Date.now(),
      isReady: false,
    };

    updatePlantedCrops([...plantedCrops, newCrop]);
    setSelectedSeed(null);
  };

  const handleHarvest = (crop: PlantedCrop) => {
    // Убираем растение с поля
    updatePlantedCrops(plantedCrops.filter((c) => c.id !== crop.id));

    // Добавляем плод в инвентарь
    const cropItem = CROP_ITEMS.find(
      (item) => item.id === crop.item.id.replace("_seed", "")
    );
    if (cropItem) {
      const existing = inventory.find(
        (invItem) => invItem.item.id === cropItem.id
      );
      if (existing) {
        updateInventory(
          inventory.map((invItem) =>
            invItem.item.id === cropItem.id
              ? { ...invItem, quantity: invItem.quantity + 1 }
              : invItem
          )
        );
      } else {
        updateInventory([...inventory, { item: cropItem, quantity: 1 }]);
      }
    }
  };

  const handleSellCrop = (crop: Item, quantity: number) => {
    if (!crop.sellPrice) return;

    // Добавляем монеты
    updateCoins(coins + crop.sellPrice * quantity);

    // Убираем из инвентаря
    updateInventory(
      inventory
        .map((invItem) =>
          invItem.item.id === crop.id
            ? { ...invItem, quantity: invItem.quantity - quantity }
            : invItem
        )
        .filter((invItem) => invItem.quantity > 0)
    );
  };

  const handleBuyItem = (item: Item, quantity: number) => {
    const totalCost = item.price * quantity;
    if (coins < totalCost) return;

    // Тратим монеты
    updateCoins(coins - totalCost);

    // Добавляем в инвентарь
    const existing = inventory.find((invItem) => invItem.item.id === item.id);
    if (existing) {
      updateInventory(
        inventory.map((invItem) =>
          invItem.item.id === item.id
            ? { ...invItem, quantity: invItem.quantity + quantity }
            : invItem
        )
      );
    } else {
      updateInventory([...inventory, { item, quantity }]);
    }

    // Обновляем магазин
    updateShopItems(
      shopItems.map((shopItem) =>
        shopItem.item.id === item.id
          ? {
              ...shopItem,
              stock: shopItem.stock - quantity,
              available: shopItem.stock - quantity > 0,
            }
          : shopItem
      )
    );
  };

  const renderFarmGrid = () => {
    const cells = [];
    for (let y = 0; y < FARM_GRID.height; y++) {
      for (let x = 0; x < FARM_GRID.width; x++) {
        const crop = plantedCrops.find((c) => c.x === x && c.y === y);
        const progress = crop
          ? Math.min(
              (Date.now() - crop.plantedAt) / (crop.item.growthTime * 1000),
              1
            )
          : 0;

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`w-16 h-16 border border-green-800 bg-green-900 cursor-pointer hover:bg-green-800 flex items-center justify-center text-2xl relative ${
              selectedSeed ? "hover:border-yellow-400" : ""
            }`}
            onClick={() => handleCellClick(x, y)}
          >
            {crop && (
              <div
                className="text-2xl cursor-pointer relative"
                onClick={(e) => {
                  e.stopPropagation();
                  if (crop.isReady) {
                    handleHarvest(crop);
                  }
                }}
              >
                {crop.isReady ? crop.item.icon.replace("_seed", "") : "🌱"}
                {crop.isReady && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                )}
                {!crop.isReady && (
                  <div className="absolute -bottom-1 left-0 w-full h-1 bg-gray-600 rounded">
                    <div
                      className="h-full bg-green-400 rounded transition-all duration-1000"
                      style={{ width: `${progress * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-green-900 text-white p-4">
      {/* Верхняя панель */}
      <div className="flex justify-between items-center mb-4 bg-gray-800 p-4 rounded-lg">
        <h1 className="text-2xl font-bold font-pixelify-sans">ФЕРМА</h1>
        <div className="flex items-center gap-4">
          <div className="text-yellow-400 font-pixelify-sans">💰 {coins}</div>
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
        onPlantSeed={handlePlantSeed}
        onSellCrop={handleSellCrop}
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
