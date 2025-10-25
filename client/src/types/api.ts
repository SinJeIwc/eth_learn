// API Response Types
export interface InventoryItemAPI {
  sku: string;
  type: "virtual_good";
  name: string;
  quantity: number;
  description: string;
  image_url: string;
}

export interface InventoryResponse {
  items: InventoryItemAPI[];
}

export interface ShopItemAPI {
  sku: string;
  name: {
    en: string;
  };
  description: {
    en: string;
  };
  image_url: string;
  type: "virtual_good";
  price: {
    amount: string;
    amount_without_discount: string;
    currency: string;
  };
  limits: {
    per_user: {
      total: number;
      available: number;
    };
  };
}

export interface ShopResponse {
  items: ShopItemAPI[];
}

// Internal Game Types
export interface Item {
  id: string;
  name: string;
  type: "seed" | "crop";
  description: string;
  price: number;
  sellPrice?: number;
  growthTime: number; // seconds
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

// Plant type mapping
export const PLANT_TYPES = {
  seed_wheat: "wheat",
  seed_grape: "grape",
  seed_pumpkin: "pumpkin",
  fetus_wheat: "wheat",
  fetus_grape: "grape",
  fetus_pumpkin: "pumpkin",
} as const;

// Growth times (in seconds)
export const GROWTH_TIMES = {
  wheat: 15,
  grape: 25,
  pumpkin: 30,
} as const;

// Sell prices
export const SELL_PRICES = {
  fetus_wheat: 15,
  fetus_grape: 30,
  fetus_pumpkin: 40,
} as const;
