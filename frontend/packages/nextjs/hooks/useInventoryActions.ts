import { useRef } from "react";
import { useFarmContracts } from "./useFarmContracts";
import { Item } from "@/types/farm";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useInventoryStore } from "~~/stores/inventoryStore";
import { usePlantStore } from "~~/stores/plantStore";

export const useInventoryActions = () => {
  const { plantSeed } = useFarmContracts();
  const { removeItem } = useInventoryStore();
  const { addPlantedSeed, getPlantedSeed } = usePlantStore();
  const { writeContractAsync: writeFarmCoin } = useScaffoldWriteContract("FarmCoin");

  // Защита от множественных вызовов
  const lastPlantTime = useRef<number>(0);

  const seedTypeMap: Record<string, number> = {
    wheat_seed: 0,
    grape_seed: 1,
    pumpkin_seed: 2,
  };

  const handlePlantSeed = async (item: Item, quantity: number, x?: number, y?: number) => {
    // Защита от множественных быстрых кликов (минимум 2 секунды между посадками)
    const now = Date.now();
    if (now - lastPlantTime.current < 2000) {
      console.log("⏳ Too fast! Please wait before planting another seed.");
      return false;
    }
    lastPlantTime.current = now;

    try {
      const seedType = seedTypeMap[item.id] ?? 0;

      console.log("🌱 Planting seed:", { seedType, quantity, x, y });

      // Проверяем, что указаны координаты
      if (x === undefined || y === undefined) {
        console.error("❌ Coordinates not specified");
        return false;
      }

      // Проверяем, что клетка свободна
      const existingSeed = getPlantedSeed(x, y);
      if (existingSeed) {
        console.log("⚠️ Cell already occupied");
        return false;
      }

      console.log("📤 Sending plantSeed transaction...");

      // Дожидаемся успешной транзакции перед удалением из инвентаря
      await plantSeed(seedType);

      console.log("✅ Transaction confirmed!");

      // Удаляем семя только после успешной посадки
      removeItem(item.id, quantity);

      // Добавляем посаженное семя в локальное хранилище с таймером 1 минута
      const plantedAt = Date.now();
      const growthTime = 60000; // 1 минута в миллисекундах

      addPlantedSeed({
        id: `${x}-${y}-${plantedAt}`,
        x,
        y,
        seedType: item.id,
        plantedAt,
        growthTime,
      });

      console.log(`✅ Successfully planted ${item.name} at (${x}, ${y})! Ready in 1 minute.`);
      return true;
    } catch (error: any) {
      console.error("❌ Failed to plant seed:", error);

      // Обработка специфичных ошибок
      if (error?.message?.includes("nonce")) {
        console.log("⏭️ Nonce error - transaction may already be pending. Skipping...");
        // Не показываем ошибку пользователю, т.к. транзакция может быть уже в мемпуле
        return false;
      } else if (error?.message?.includes("rejected")) {
        console.log("❌ Transaction rejected by user");
        return false;
      } else if (error?.message?.includes("insufficient funds")) {
        alert("❌ Insufficient funds to pay for gas");
        return false;
      }

      return false;
    }
  };

  const handleSellCrop = async (item: Item, quantity: number) => {
    try {
      if (!item.sellPrice || item.sellPrice <= 0) {
        console.log("❌ This item cannot be sold (no sell price)");
        return false;
      }

      // Вызываем claimTokens для получения монет (временное решение для демо)
      await writeFarmCoin({
        functionName: "claimTokens",
      });

      // Удаляем плод из инвентаря после успешной транзакции
      removeItem(item.id, quantity);

      console.log(`✅ Successfully sold ${quantity} ${item.name}!`);
      console.log(`💰 Claimed 1000 FarmCoin tokens!`);
      return true;
    } catch (error) {
      console.error("❌ Failed to sell crop:", error);
      return false;
    }
  };

  return {
    handlePlantSeed,
    handleSellCrop,
  };
};
