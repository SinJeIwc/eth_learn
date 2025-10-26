import { useEffect, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { parseAbi } from "viem";
import contractAddresses from "@/contracts/addresses.json";

const GAME_EVENTS_ABI = parseAbi([
  "function canTriggerEvent() view returns (bool)",
  "function triggerEvent() external",
  "function getEventsCount() view returns (uint256)",
  "function lastEventHour() view returns (uint256)",
]);

export function useHourlyEventTrigger() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedHour, setLastCheckedHour] = useState<number | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const checkAndTriggerEvent = async () => {
    if (!publicClient || !walletClient || isChecking) return;

    try {
      setIsChecking(true);

      // Получаем текущий час
      const currentHour = Math.floor(Date.now() / 1000 / 3600);

      // Если уже проверяли в этом часу, пропускаем
      if (lastCheckedHour === currentHour) {
        return;
      }

      // Проверяем, можно ли триггернуть событие
      const canTrigger = (await publicClient.readContract({
        address: contractAddresses.GameEvents as `0x${string}`,
        abi: GAME_EVENTS_ABI,
        functionName: "canTriggerEvent",
      })) as boolean;

      if (canTrigger) {
        console.log("🎲 Triggering hourly event...");

        // Триггерим событие
        const hash = await walletClient.writeContract({
          address: contractAddresses.GameEvents as `0x${string}`,
          abi: GAME_EVENTS_ABI,
          functionName: "triggerEvent",
          account: walletClient.account,
        });

        // Ждем подтверждения транзакции
        await publicClient.waitForTransactionReceipt({ hash });

        // Получаем обновленный счетчик событий
        const newCount = (await publicClient.readContract({
          address: contractAddresses.GameEvents as `0x${string}`,
          abi: GAME_EVENTS_ABI,
          functionName: "getEventsCount",
        })) as bigint;

        setEventCount(Number(newCount));
        console.log(
          "✅ Event triggered successfully! Total events:",
          Number(newCount)
        );
      }

      setLastCheckedHour(currentHour);
    } catch (error) {
      console.error("Error checking/triggering event:", error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Проверяем сразу при монтировании
    checkAndTriggerEvent();

    // Вычисляем время до следующего часа
    const now = Date.now();
    const msUntilNextHour = 3600000 - (now % 3600000);

    // Устанавливаем таймер на начало следующего часа
    const initialTimer = setTimeout(() => {
      checkAndTriggerEvent();

      // После первого триггера устанавливаем интервал каждый час
      const hourlyInterval = setInterval(checkAndTriggerEvent, 3600000);

      return () => clearInterval(hourlyInterval);
    }, msUntilNextHour);

    return () => clearTimeout(initialTimer);
  }, [publicClient, walletClient]);

  return {
    isChecking,
    eventCount,
    checkAndTriggerEvent,
  };
}
