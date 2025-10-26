import { useCallback, useEffect, useState } from "react";
import { parseAbi } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

const GAME_EVENTS_ABI = parseAbi([
  "function canTriggerEvent() view returns (bool)",
  "function triggerEvent() external",
  "function getEventsCount() view returns (uint256)",
  "function lastEventTime() view returns (uint256)",
]);

const EVENT_INTERVAL_MS = 2 * 60 * 1000; // 2 минуты в миллисекундах

export function useHourlyEventTrigger() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<number | null>(null);
  const [lastTriggerAttempt, setLastTriggerAttempt] = useState<number>(0);
  const [eventCount, setEventCount] = useState(0);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const checkAndTriggerEvent = useCallback(async () => {
    if (!publicClient || !walletClient || isChecking) return;

    // Защита от множественных вызовов: минимум 30 секунд между попытками
    const now = Date.now();
    if (now - lastTriggerAttempt < 30000) {
      console.log("⏳ Too soon since last trigger attempt, skipping...");
      return;
    }

    try {
      setIsChecking(true);
      setLastTriggerAttempt(now);

      // Округляем текущее время до 2-минутного интервала (в секундах)
      const currentTimeSeconds = Math.floor(Date.now() / 1000);
      const roundedTime = Math.floor(currentTimeSeconds / 120) * 120;

      if (lastCheckedTime === roundedTime) {
        return;
      }

      const chainId = scaffoldConfig.targetNetworks[0].id;
      const gameEventsAddress = deployedContracts[chainId]?.GameEvents?.address;

      if (!gameEventsAddress) {
        console.error("GameEvents contract address not found");
        return;
      }

      const canTrigger = (await publicClient.readContract({
        address: gameEventsAddress as `0x${string}`,
        abi: GAME_EVENTS_ABI,
        functionName: "canTriggerEvent",
      })) as boolean;

      if (canTrigger) {
        console.log("🎲 Triggering event (2-minute interval)...");

        try {
          const hash = await walletClient.writeContract({
            address: gameEventsAddress as `0x${string}`,
            abi: GAME_EVENTS_ABI,
            functionName: "triggerEvent",
            account: walletClient.account,
          });

          await publicClient.waitForTransactionReceipt({ hash });

          const newCount = (await publicClient.readContract({
            address: gameEventsAddress as `0x${string}`,
            abi: GAME_EVENTS_ABI,
            functionName: "getEventsCount",
          })) as bigint;

          setEventCount(Number(newCount));
          console.log("✅ Event triggered successfully! Total events:", Number(newCount));
        } catch (txError: any) {
          // Игнорируем ошибки nonce и "already known" - транзакция уже в мемпуле
          if (
            txError?.message?.includes("nonce") ||
            txError?.message?.includes("already known") ||
            txError?.details?.includes("already known")
          ) {
            console.log("⏭️ Transaction already pending, skipping...");
          } else {
            throw txError; // Пробрасываем другие ошибки
          }
        }
      }

      setLastCheckedTime(roundedTime);
    } catch (error) {
      console.error("Error checking/triggering event:", error);
    } finally {
      setIsChecking(false);
    }
  }, [publicClient, walletClient, isChecking, lastCheckedTime, lastTriggerAttempt]);

  useEffect(() => {
    checkAndTriggerEvent();

    // Вычисляем время до следующего 2-минутного интервала
    const now = Date.now();
    const msUntilNextInterval = EVENT_INTERVAL_MS - (now % EVENT_INTERVAL_MS);

    const initialTimer = setTimeout(() => {
      checkAndTriggerEvent();

      // После первого триггера проверяем каждые 2 минуты
      const intervalTimer = setInterval(checkAndTriggerEvent, EVENT_INTERVAL_MS);

      return () => clearInterval(intervalTimer);
    }, msUntilNextInterval);

    return () => clearTimeout(initialTimer);
  }, [checkAndTriggerEvent]);

  return {
    isChecking,
    eventCount,
    checkAndTriggerEvent,
  };
}
