import { useEffect, useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const MARKET_UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 минут

export function useMarketUpdateNotifier() {
  const [timeUntilUpdate, setTimeUntilUpdate] = useState<number>(0);
  const [lastInterval, setLastInterval] = useState<string | null>(null);

  // Используем getEventsCount вместо несуществующей getMarketIntervalNumber
  const { data: eventsCount, refetch } = useScaffoldReadContract({
    contractName: "GameEvents",
    functionName: "getEventsCount",
  });

  // Вычисляем текущий 5-минутный интервал на основе времени
  const currentInterval = Math.floor(Date.now() / 1000 / 300).toString();

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const msIntoCurrentInterval = now % MARKET_UPDATE_INTERVAL_MS;
      const msUntilNext = MARKET_UPDATE_INTERVAL_MS - msIntoCurrentInterval;
      setTimeUntilUpdate(Math.ceil(msUntilNext / 1000)); // В секундах
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentInterval) return;

    const intervalStr = currentInterval.toString();

    // Если интервал изменился, показываем уведомление
    if (lastInterval !== null && lastInterval !== intervalStr) {
      console.log("🛒 Магазин обновлен! Новый интервал:", intervalStr);
    }

    setLastInterval(intervalStr);
  }, [currentInterval, lastInterval]);

  // Периодически обновляем данные с контракта
  useEffect(() => {
    const refetchInterval = setInterval(() => {
      refetch();
    }, 30000); // Проверяем каждые 30 секунд

    return () => clearInterval(refetchInterval);
  }, [refetch]);

  return {
    timeUntilUpdate,
    currentInterval: currentInterval?.toString() || "0",
  };
}
