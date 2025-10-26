"use client";

import { useEffect, useState } from "react";
import { parseAbi } from "viem";
import { usePublicClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useMarketUpdateNotifier } from "~~/hooks/useMarketUpdateNotifier";
import scaffoldConfig from "~~/scaffold.config";

const GAME_EVENTS_ABI = parseAbi([
  "function getEvent(uint256 eventId) external view returns (uint8 eventType, uint16 severity, uint256 timestamp)",
  "function getEventsCount() external view returns (uint256)",
]);

const EVENT_NAMES = ["Нет события", "🌧️ Дождь", "☀️ Засуха", "❄️ Зима"];
const EVENT_DESCRIPTIONS = [
  "Погода благоприятная",
  "Дождь ускоряет рост всех растений на 10 минут!",
  "Засуха! Цены на пшеницу удвоились!",
  "Зима! 10-50% урожая может погибнуть!",
];

const EVENT_COLORS = ["bg-gray-500", "bg-blue-500", "bg-yellow-500", "bg-cyan-500"];

interface CurrentEvent {
  type: number;
  severity: number;
  timestamp: number;
}

export default function EventNotification() {
  const [currentEvent, setCurrentEvent] = useState<CurrentEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const publicClient = usePublicClient();
  const { timeUntilUpdate } = useMarketUpdateNotifier();

  useEffect(() => {
    const fetchCurrentEvent = async () => {
      if (!publicClient) return;

      try {
        const chainId = scaffoldConfig.targetNetworks[0].id;
        const gameEventsAddress = deployedContracts[chainId]?.GameEvents?.address;

        if (!gameEventsAddress) {
          console.error("GameEvents contract not found");
          return;
        }

        // Получаем количество событий
        const count = (await publicClient.readContract({
          address: gameEventsAddress as `0x${string}`,
          abi: GAME_EVENTS_ABI,
          functionName: "getEventsCount",
        })) as bigint;

        setEventCount(Number(count));

        // Если есть события, получаем последнее
        if (count > 0n) {
          const lastEventId = count - 1n;
          const event = (await publicClient.readContract({
            address: gameEventsAddress as `0x${string}`,
            abi: GAME_EVENTS_ABI,
            functionName: "getEvent",
            args: [lastEventId],
          })) as [number, number, bigint];

          setCurrentEvent({
            type: event[0],
            severity: event[1],
            timestamp: Number(event[2]),
          });
        }
      } catch (error) {
        console.error("Error fetching current event:", error);
      }
    };

    fetchCurrentEvent();

    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchCurrentEvent, 30000);
    return () => clearInterval(interval);
  }, [publicClient]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const eventName = currentEvent ? EVENT_NAMES[currentEvent.type] || "Неизвестное событие" : "";
  const eventDescription = currentEvent ? EVENT_DESCRIPTIONS[currentEvent.type] || "" : "";
  const eventColor = currentEvent ? EVENT_COLORS[currentEvent.type] || "bg-gray-500" : "bg-gray-500";
  const showEventNotification = currentEvent && currentEvent.type !== 0;

  return (
    <>
      {/* Уведомление о текущем событии - слева снизу */}
      {showEventNotification && (
        <div
          className={`fixed bottom-4 left-4 ${eventColor} bg-opacity-90 p-4 rounded-lg shadow-2xl max-w-sm z-40 animate-pulse`}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{eventName.split(" ")[0]}</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold font-pixelify-sans mb-1">{eventName}</h3>
              <p className="text-sm mb-2">{eventDescription}</p>
              <div className="text-xs opacity-75">Событий за всё время: {eventCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Таймер обновления магазина */}
      <div className="fixed bottom-4 right-4 bg-purple-600 bg-opacity-90 p-3 rounded-lg shadow-xl z-40">
        <div className="flex items-center gap-2">
          <div className="text-2xl">🛒</div>
          <div>
            <div className="text-xs font-bold font-pixelify-sans">Обновление магазина</div>
            <div className="text-lg font-mono">{formatTime(timeUntilUpdate)}</div>
          </div>
        </div>
      </div>
    </>
  );
}
