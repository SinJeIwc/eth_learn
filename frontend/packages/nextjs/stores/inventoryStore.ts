import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface InventoryItem {
  id: string;
  name: string;
  type: "seed" | "crop";
  seedType?: number;
  quantity: number;
  icon: string;
  description: string;
  sellPrice?: number;
}

interface InventoryStore {
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, "quantity">, quantity: number) => void;
  removeItem: (id: string, quantity: number) => void;
  getItem: (id: string) => InventoryItem | undefined;
  clearInventory: () => void;
  updateItemQuantity: (id: string, quantity: number) => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity) => {
        set(state => {
          const existingItem = state.items.find(i => i.id === item.id);

          if (existingItem) {
            return {
              items: state.items.map(i => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i)),
            };
          }

          return {
            items: [...state.items, { ...item, quantity }],
          };
        });
      },

      removeItem: (id, quantity) => {
        set(state => {
          const existingItem = state.items.find(i => i.id === id);

          if (!existingItem) return state;

          if (existingItem.quantity <= quantity) {
            return {
              items: state.items.filter(i => i.id !== id),
            };
          }

          return {
            items: state.items.map(i => (i.id === id ? { ...i, quantity: i.quantity - quantity } : i)),
          };
        });
      },

      getItem: id => {
        return get().items.find(i => i.id === id);
      },

      clearInventory: () => {
        set({ items: [] });
      },

      updateItemQuantity: (id, quantity) => {
        set(state => ({
          items: state.items.map(i => (i.id === id ? { ...i, quantity } : i)),
        }));
      },
    }),
    {
      name: "farm-inventory-storage",
    },
  ),
);
