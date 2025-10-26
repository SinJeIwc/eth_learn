import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const useShopInventory = () => {
  const { address } = useAccount();

  // Получаем номер текущего 5-минутного интервала для обновления магазина
  const { data: marketInterval } = useScaffoldReadContract({
    contractName: "GameEvents",
    functionName: "getMarketIntervalNumber",
  });

  const inventory = useMemo(() => {
    if (!address) {
      return { wheat: 0, grape: 0, pumpkin: 0, interval: "0" };
    }

    // Используем номер 5-минутного интервала вместо eventCount
    const intervalStr = marketInterval ? marketInterval.toString() : Math.floor(Date.now() / 300000).toString();
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
  }, [address, marketInterval]);

  return inventory;
};
