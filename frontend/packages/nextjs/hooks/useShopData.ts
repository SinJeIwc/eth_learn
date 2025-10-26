import { useShopInventory } from "./useShopInventory";

export const useShopData = (boughtSeeds: Record<string, number>) => {
  const shopInventory = useShopInventory();

  const getAvailableSeeds = (seedType: keyof typeof shopInventory) => {
    if (seedType === "date") return 0;
    return Math.max(0, (shopInventory[seedType] as number) - boughtSeeds[seedType]);
  };

  const shopItems = [
    {
      item: {
        id: "wheat_seed",
        name: "Wheat Seed",
        type: "seed" as const,
        icon: "/Plants/wheat/wheat_seed.png",
        price: 10,
        description: "Fast growing wheat",
        growthTime: 30,
      },
      stock: getAvailableSeeds("wheat"),
      available: getAvailableSeeds("wheat") > 0,
    },
    {
      item: {
        id: "grape_seed",
        name: "Grape Seed",
        type: "seed" as const,
        icon: "/Plants/grape/grape_seed.png",
        price: 20,
        description: "Valuable grapes",
        growthTime: 60,
      },
      stock: getAvailableSeeds("grape"),
      available: getAvailableSeeds("grape") > 0,
    },
    {
      item: {
        id: "pumpkin_seed",
        name: "Pumpkin Seed",
        type: "seed" as const,
        icon: "/Plants/pumpkin/pumpkin_seed.png",
        price: 15,
        description: "Halloween special",
        growthTime: 45,
      },
      stock: getAvailableSeeds("pumpkin"),
      available: getAvailableSeeds("pumpkin") > 0,
    },
  ];

  return { shopItems };
};
