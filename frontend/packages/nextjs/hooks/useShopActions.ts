import { useState } from "react";
import { useFarmContracts } from "./useFarmContracts";
import { useInventoryStore } from "~~/stores/inventoryStore";

export const useShopActions = () => {
  const { buySeeds } = useFarmContracts();
  const { addItem } = useInventoryStore();

  const [boughtSeeds, setBoughtSeeds] = useState<Record<string, number>>({
    wheat: 0,
    grape: 0,
    pumpkin: 0,
  });

  const seedTypeMap: Record<string, number> = {
    wheat: 0,
    grape: 1,
    pumpkin: 2,
  };

  const seedIcons: Record<string, string> = {
    wheat: "/Plants/wheat/wheat_seed.png",
    grape: "/Plants/grape/grape_seed.png",
    pumpkin: "/Plants/pumpkin/pumpkin_seed.png",
  };

  const handleBuySeeds = async (seedType: string, quantity: number = 1) => {
    try {
      await buySeeds(seedType, quantity);
      setBoughtSeeds(prev => ({ ...prev, [seedType]: prev[seedType] + quantity }));

      addItem(
        {
          id: `${seedType}_seed`,
          name: `${seedType.charAt(0).toUpperCase() + seedType.slice(1)} Seed`,
          type: "seed",
          seedType: seedTypeMap[seedType],
          icon: seedIcons[seedType] || "/Plants/wheat/wheat_seed.png",
          description: `Plant this ${seedType} seed on your farm`,
          sellPrice: 0,
        },
        quantity,
      );

      alert(`Successfully bought ${quantity} ${seedType} seed${quantity > 1 ? "s" : ""}!`);
    } catch (error) {
      console.error("Failed to buy seeds:", error);
      alert("Failed to buy seeds. Check console for details.");
    }
  };

  return {
    boughtSeeds,
    handleBuySeeds,
  };
};
