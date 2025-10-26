// Типы данных для фермы
export interface Item {
  id: string;
  name: string;
  type: "seed" | "crop";
  description: string;
  price: number;
  sellPrice?: number;
  growthTime: number; // в секундах для демо
  icon: string;
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface PlantedCrop {
  id: string;
  item: Item;
  x: number;
  y: number;
  plantedAt: number;
  isReady: boolean;
}

export interface ShopItem {
  item: Item;
  stock: number;
  available: boolean;
}

// Mock data for seeds and crops
export const SEED_ITEMS: Item[] = [
  {
    id: "wheat_seed",
    name: "Wheat Seeds",
    type: "seed",
    description: "Golden wheat. Grows in 60 seconds.",
    price: 5,
    growthTime: 60,
    icon: "/Plants/wheat/seed.png",
  },
  {
    id: "grape_seed",
    name: "Grape Seeds",
    type: "seed",
    description: "Juicy grapes. Grows in 60 seconds.",
    price: 12,
    growthTime: 60,
    icon: "/Plants/grape/seed.png",
  },
  {
    id: "pumpkin_seed",
    name: "Pumpkin Seeds",
    type: "seed",
    description: "Big orange pumpkin. Grows in 60 seconds.",
    price: 15,
    growthTime: 60,
    icon: "/Plants/pumpkin/seed.png",
  },
];

export const CROP_ITEMS: Item[] = [
  {
    id: "wheat",
    name: "Wheat",
    type: "crop",
    description: "Golden wheat.",
    price: 0,
    sellPrice: 15,
    growthTime: 0,
    icon: "/Plants/wheat/fetus.png",
  },
  {
    id: "grape",
    name: "Grapes",
    type: "crop",
    description: "Ripe grapes.",
    price: 0,
    sellPrice: 30,
    growthTime: 0,
    icon: "/Plants/grape/fetus.png",
  },
  {
    id: "pumpkin",
    name: "Pumpkin",
    type: "crop",
    description: "Big pumpkin.",
    price: 0,
    sellPrice: 40,
    growthTime: 0,
    icon: "/Plants/pumpkin/fetus.png",
  },
];

export const MOCK_SHOP_DATA: ShopItem[] = [
  {
    item: SEED_ITEMS[0], // помидор
    stock: 5,
    available: true,
  },
  {
    item: SEED_ITEMS[1], // морковь
    stock: 0,
    available: false,
  },
  {
    item: SEED_ITEMS[2], // пшеница
    stock: 10,
    available: true,
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    item: SEED_ITEMS[0],
    quantity: 2,
  },
  {
    item: SEED_ITEMS[2],
    quantity: 3,
  },
];

export const FARM_GRID = {
  width: 8,
  height: 6,
  cellSize: 80,
};
