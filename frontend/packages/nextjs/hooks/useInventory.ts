import { useMemo } from "react";
import { InventoryItem } from "@/types/farm";
import { useInventoryStore } from "~~/stores/inventoryStore";

export const useInventory = () => {
  const storeItems = useInventoryStore(state => state.items);

  const inventory = useMemo((): InventoryItem[] => {
    return storeItems.map(item => ({
      item: {
        id: item.id,
        name: item.name,
        type: item.type,
        icon: item.icon,
        price: 0,
        description: item.description,
        growthTime: 0,
        sellPrice: item.sellPrice,
      },
      quantity: item.quantity,
    }));
  }, [storeItems]);

  return inventory;
};
