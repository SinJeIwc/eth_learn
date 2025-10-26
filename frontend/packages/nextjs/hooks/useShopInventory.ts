import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const useShopInventory = () => {
  const { address } = useAccount();

  // Получаем номер текущего 5-минутного интервала для обновления магазина
  // Используем getEventsCount вместо несуществующей getMarketIntervalNumber
  const { data: eventsCount } = useScaffoldReadContract({
    contractName: "GameEvents",
    functionName: "getEventsCount",
  });

  const inventory = useMemo(() => {
    if (!address) {
      return { wheat: 0, grape: 0, pumpkin: 0, interval: "0" };
    }

    // Используем количество событий и текущее время для определения интервала
    const currentTime = Math.floor(Date.now() / 1000); // Текущее время в секундах
    const marketInterval = Math.floor(currentTime / 300); // 300 секунд = 5 минут
    const intervalStr = marketInterval.toString();
    const addr = address.toLowerCase();

    const generateSeedCount = (seedType: string): number => {
      const combined = `${addr}${intervalStr}${seedType}`;
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash) % 11;
    };

    return {
      wheat: generateSeedCount("wheat"),
      grape: generateSeedCount("grape"),
      pumpkin: generateSeedCount("pumpkin"),
      interval: intervalStr,
    };
  }, [address]);

  return inventory;
};
