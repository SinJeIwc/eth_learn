"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useFarmContracts } from "~~/hooks/useFarmContracts";
import { UI_PATHS } from "~~/lib/constants";
import { notification } from "~~/utils/scaffold-eth";

type LocationAction = "buy" | "sell";

type MapLocation = {
  id: "castle" | "mill" | "farmhouse";
  name: string;
  action: LocationAction;
  cropType: "pumpkin" | "wheat" | "grape";
  cropName: string;
  description: string;
  bonus: string;
  image: string;
  position: {
    top: string;
    left: string;
  };
};

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins?: number;
  inventory?: {
    pumpkin: number;
    wheat: number;
    grape: number;
  };
  onBuySeeds?: (cropType: string, amount: number) => void;
  onSellCrops?: (cropType: string, amount: number) => void;
}

const PRICES = {
  pumpkin_seed: 50,
  wheat_seed: 20,
  grape_seed: 30,
  pumpkin_sell: 100,
  wheat_sell: 40,
  wheat_sell_bonus: 60, // +50% в мельнице
  grape_sell: 60,
  grape_sell_bonus: 78, // +30% в винодельне
};

const LOCATIONS: MapLocation[] = [
  {
    id: "castle",
    name: "Замок",
    action: "buy",
    cropType: "pumpkin",
    cropName: "Семена тыквы",
    description: "Королевский замок находится на севере. Здесь королевская стража торгует редкими семенами тыкв.",
    bonus: "Можно купить семена тыквы",
    image: "/UI/castle.png",
    position: { top: "8%", left: "50%" },
  },
  {
    id: "mill",
    name: "Мельница",
    action: "sell",
    cropType: "wheat",
    cropName: "Пшеница",
    description: "Старая мельница на западе. Мельник предлагает лучшую цену за пшеницу в регионе!",
    bonus: "+50% к цене пшеницы",
    image: "/UI/mill.png",
    position: { top: "40%", left: "10%" },
  },
  {
    id: "farmhouse",
    name: "Винодельня",
    action: "sell",
    cropType: "grape",
    cropName: "Виноград",
    description: "Уютная винодельня на востоке. Винодел платит щедро за качественный виноград.",
    bonus: "+30% к цене винограда",
    image: "/UI/house.png",
    position: { top: "45%", left: "85%" },
  },
];

export default function MapModal({ isOpen, onClose, coins, inventory, onBuySeeds, onSellCrops }: MapModalProps) {
  const [selectedId, setSelectedId] = useState<MapLocation["id"] | null>(null);
  const [hoveredId, setHoveredId] = useState<MapLocation["id"] | null>(null);
  const [tradeAmount, setTradeAmount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Блокчейн хуки
  const { isConnected } = useAccount();
  const { buySeeds, approveFarmCoin } = useFarmContracts();

  const selectedLocation = useMemo(() => LOCATIONS.find(location => location.id === selectedId), [selectedId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setHoveredId(null);
      setTradeAmount(1);
    }
  }, [isOpen]);

  useEffect(() => {
    setTradeAmount(1);
  }, [selectedId]);

  if (!isOpen) {
    return null;
  }

  const handleLocationClick = (location: MapLocation) => {
    setSelectedId(location.id);
  };

  const getInventoryCount = (cropType: string) => {
    if (!inventory) return 0;
    return inventory[cropType as keyof typeof inventory] || 0;
  };

  const getSellPrice = (location: MapLocation, amount: number) => {
    if (location.cropType === "wheat" && location.id === "mill") {
      return PRICES.wheat_sell_bonus * amount;
    }
    if (location.cropType === "grape" && location.id === "farmhouse") {
      return PRICES.grape_sell_bonus * amount;
    }
    return PRICES[`${location.cropType}_sell` as keyof typeof PRICES] * amount;
  };

  const getBuyPrice = (location: MapLocation, amount: number) => {
    return PRICES[`${location.cropType}_seed` as keyof typeof PRICES] * amount;
  };

  const getMaxBuyAmount = () => {
    if (!selectedLocation || !coins) return 0;
    const price = PRICES[`${selectedLocation.cropType}_seed` as keyof typeof PRICES];
    return Math.floor(coins / price);
  };

  const getMaxSellAmount = () => {
    if (!selectedLocation) return 0;
    return getInventoryCount(selectedLocation.cropType);
  };

  const handleTrade = async () => {
    if (!selectedLocation || tradeAmount <= 0) return;

    // Покупка семян через блокчейн
    if (selectedLocation.action === "buy" && isConnected) {
      const totalCost = getBuyPrice(selectedLocation, tradeAmount);
      if (!coins || coins < totalCost) {
        notification.error("Недостаточно монет!");
        return;
      }

      setIsProcessing(true);
      try {
        notification.info("Одобрение траты FarmCoin...");

        // Шаг 1: Одобрить трату FarmCoin
        await approveFarmCoin(BigInt(Math.floor(totalCost * 1e18)));

        notification.info(`Покупка ${tradeAmount} семян ${selectedLocation.cropName}...`);

        // Шаг 2: Купить семена
        await buySeeds(selectedLocation.cropType, tradeAmount);

        notification.success(`✅ Куплено ${tradeAmount} семян ${selectedLocation.cropName}!`);
        setTradeAmount(1);
      } catch (error: any) {
        console.error("Ошибка покупки:", error);
        if (error.message?.includes("user rejected")) {
          notification.error("Транзакция отменена");
        } else {
          notification.error("Ошибка при покупке семян");
        }
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Локальная логика (если кошелек не подключен или продажа)
    if (selectedLocation.action === "buy") {
      const totalCost = getBuyPrice(selectedLocation, tradeAmount);
      if (coins && coins >= totalCost) {
        onBuySeeds?.(selectedLocation.cropType, tradeAmount);
        setTradeAmount(1);
      }
    } else {
      const availableAmount = getInventoryCount(selectedLocation.cropType);
      if (availableAmount >= tradeAmount) {
        onSellCrops?.(selectedLocation.cropType, tradeAmount);
        setTradeAmount(1);
      }
    }
  };

  const canTrade = () => {
    if (!selectedLocation || tradeAmount <= 0) return false;

    if (selectedLocation.action === "buy") {
      return !!coins && coins >= getBuyPrice(selectedLocation, tradeAmount);
    } else {
      return getInventoryCount(selectedLocation.cropType) >= tradeAmount;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl mx-4">
        <div className="relative overflow-hidden rounded-2xl border-4 border-amber-600/60 bg-gradient-to-br from-amber-950/90 via-stone-900/90 to-amber-950/90 shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 border-2 border-amber-500/50 hover:bg-black/90 hover:border-amber-400"
            aria-label="Закрыть карту"
          >
            <Image src={UI_PATHS.CLOSE} alt="Закрыть" width={24} height={24} />
          </button>

          <div className="p-2">
            <div className="flex items-center gap-5 mb-2">
              <h2 className="font-pixelify-sans text-xl md:text-2xl text-amber-200 drop-shadow-lg">
                Карта торговых путей
              </h2>
              <div className="bg-amber-900/50 border-2 border-amber-600/60 rounded-lg px-3 py-1.5">
                <p className="text-yellow-400 font-bold text-lg"> {coins}</p>
              </div>
            </div>

            <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-amber-700/50">
              <Image src="/UI/map.png" alt="Карта региона" fill className="object-cover" priority sizes="100vw" />

              {LOCATIONS.map(location => {
                const isSelected = selectedLocation?.id === location.id;
                const isHovered = hoveredId === location.id;
                const scale = isHovered ? "scale-110" : "scale-100";

                return (
                  <button
                    type="button"
                    key={location.id}
                    className={`group absolute -translate-x-1/2 -translate-y-1/2 transform transition-transform duration-300 ease-out ${scale} ${isSelected ? "z-20" : "z-10"}`}
                    style={{ top: location.position.top, left: location.position.left }}
                    onClick={() => handleLocationClick(location)}
                    onMouseEnter={() => setHoveredId(location.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-label={`${location.name} - ${location.action === "buy" ? "Купить" : "Продать"} ${location.cropName}`}
                  >
                    <div className="relative">
                      <Image
                        src={location.image}
                        alt={location.name}
                        width={192}
                        height={192}
                        className="h-36 w-36 md:h-48 md:w-48 object-contain drop-shadow-2xl"
                      />

                      <div
                        className={`absolute -top-2 -right-2 px-3 py-1.5 rounded-full text-sm font-bold ${location.action === "buy" ? "bg-blue-500 text-white" : "bg-green-500 text-white"}`}
                      >
                        {location.action === "buy" ? "КУПИТЬ" : "ПРОДАТЬ"}
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <span className="block font-pixelify-sans text-lg md:text-xl text-amber-100 drop-shadow-lg font-bold">
                        {location.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t-4 border-amber-700/50 bg-gradient-to-br from-stone-900/95 to-amber-950/95 p-3 md:p-4 lg:p-6">
            {selectedLocation ? (
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <h3 className="font-pixelify-sans text-base sm:text-lg md:text-xl text-amber-200 flex items-center gap-2 flex-wrap">
                      {selectedLocation.name}
                      <span
                        className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                          selectedLocation.action === "buy"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                            : "bg-green-500/20 text-green-300 border border-green-500/50"
                        }`}
                      >
                        {selectedLocation.action === "buy" ? "Покупка" : "Продажа"}
                      </span>
                    </h3>
                    <p className="mt-1 text-amber-100/80 text-[10px] sm:text-xs md:text-sm leading-relaxed">
                      {selectedLocation.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="bg-amber-900/30 border-2 border-amber-600/40 rounded-lg p-2">
                    <p className="text-[10px] text-amber-400">
                      {selectedLocation.action === "sell" ? "В инвентаре:" : "У вас:"}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-green-400">
                      {selectedLocation.action === "sell"
                        ? `${getInventoryCount(selectedLocation.cropType)} шт`
                        : `${coins || 0} 💰`}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 border-2 border-amber-600/30 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm font-bold text-yellow-300"> {selectedLocation.bonus}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xl">На продажу</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedLocation.action === "buy" ? getMaxBuyAmount() : getMaxSellAmount()}
                      value={tradeAmount}
                      onChange={e => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        const max = selectedLocation.action === "buy" ? getMaxBuyAmount() : getMaxSellAmount();
                        setTradeAmount(Math.min(val, max));
                      }}
                      className="bg-amber-900/50 border-2 border-amber-600/50 rounded-lg px-2 sm:px-3 py-2 text-center text-xl sm:text-2xl font-bold text-amber-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 flex items-center justify-between bg-amber-950/50 border border-amber-600/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                  <span className="text-amber-300 font-bold text-sm sm:text-base">Итого:</span>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400">
                    {selectedLocation.action === "buy" ? "-" : "+"}
                    {selectedLocation.action === "buy"
                      ? getBuyPrice(selectedLocation, tradeAmount)
                      : getSellPrice(selectedLocation, tradeAmount)}{" "}
                    💰
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTrade}
                  disabled={!canTrade() || isProcessing}
                  className={`w-full py-3 sm:py-4 font-pixelify-sans text-sm sm:text-base md:text-lg rounded-lg transition-colors duration-300 shadow-lg border-2 ${
                    canTrade() && !isProcessing
                      ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white hover:shadow-amber-500/50 border-amber-500/50"
                      : "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Обработка транзакции...
                    </span>
                  ) : (
                    <>
                      {selectedLocation.action === "buy" ? "🛒 Купить семена" : "💰 Продать урожай"}
                      {isConnected && selectedLocation.action === "buy" && " (Blockchain)"}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-amber-300/70 text-sm sm:text-base font-pixelify-sans">
                  Выберите локацию на карте для торговли
                </p>
                <p className="text-amber-400/50 text-xs sm:text-sm mt-2">
                  Нажмите на иконку замка, мельницы или винодельни
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
