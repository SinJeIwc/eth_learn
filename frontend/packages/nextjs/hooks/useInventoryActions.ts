import { useFarmContracts } from "./useFarmContracts";
import { Item } from "@/types/farm";
import { useInventoryStore } from "~~/stores/inventoryStore";
import { usePlantStore } from "~~/stores/plantStore";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const useInventoryActions = () => {
  const { plantSeed } = useFarmContracts();
  const { removeItem } = useInventoryStore();
  const { addPlantedSeed, getPlantedSeed } = usePlantStore();
  const { writeContractAsync: writeFarmCoin } = useScaffoldWriteContract("FarmCoin");

  const seedTypeMap: Record<string, number> = {
    wheat_seed: 0,
    grape_seed: 1,
    pumpkin_seed: 2,
  };

  const handlePlantSeed = async (item: Item, quantity: number, x?: number, y?: number) => {
    try {
      const seedType = seedTypeMap[item.id] ?? 0;

      console.log("Planting seed:", { seedType, quantity, x, y });

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

      // Дожидаемся успешной транзакции перед удалением из инвентаря
      await plantSeed(seedType);

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
    } catch (error) {
      console.error("❌ Failed to plant seed:", error);
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

      const totalPrice = item.sellPrice * quantity;
      console.log(`✅ Successfully sold ${quantity} ${item.name}!`);
      console.log(`� Claimed 1000 FarmCoin tokens!`);
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
