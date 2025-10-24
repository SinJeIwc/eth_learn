// Типы данных для фермы
export interface Item {
  id: string;
  name: string;
  type: 'seed' | 'crop';
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

// Моковые данные для семян и плодов
export const SEED_ITEMS: Item[] = [
  {
    id: 'tomato_seed',
    name: 'Семена помидора',
    type: 'seed',
    description: 'Красные сочные помидоры. Растут 15 секунд.',
    price: 10,
    growthTime: 15,
    icon: '🍅'
  },
  {
    id: 'carrot_seed',
    name: 'Семена моркови',
    type: 'seed',
    description: 'Оранжевая хрустящая морковь. Растет 20 секунд.',
    price: 8,
    growthTime: 20,
    icon: '🥕'
  },
  {
    id: 'wheat_seed',
    name: 'Семена пшеницы',
    type: 'seed',
    description: 'Золотистая пшеница. Растет 10 секунд.',
    price: 5,
    growthTime: 10,
    icon: '🌾'
  }
];

export const CROP_ITEMS: Item[] = [
  {
    id: 'tomato',
    name: 'Помидор',
    type: 'crop',
    description: 'Спелый красный помидор.',
    price: 0,
    sellPrice: 25,
    growthTime: 0,
    icon: '🍅'
  },
  {
    id: 'carrot',
    name: 'Морковь',
    type: 'crop',
    description: 'Свежая морковь.',
    price: 0,
    sellPrice: 20,
    growthTime: 0,
    icon: '🥕'
  },
  {
    id: 'wheat',
    name: 'Пшеница',
    type: 'crop',
    description: 'Золотистая пшеница.',
    price: 0,
    sellPrice: 15,
    growthTime: 0,
    icon: '🌾'
  }
];

// Моковые данные магазина (не всегда все семена в наличии)
export const MOCK_SHOP_DATA: ShopItem[] = [
  {
    item: SEED_ITEMS[0], // помидор
    stock: 5,
    available: true
  },
  {
    item: SEED_ITEMS[1], // морковь
    stock: 0,
    available: false
  },
  {
    item: SEED_ITEMS[2], // пшеница
    stock: 10,
    available: true
  }
];

// Начальный инвентарь игрока
export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    item: SEED_ITEMS[0],
    quantity: 2
  },
  {
    item: SEED_ITEMS[2],
    quantity: 3
  }
];

// Размер поля
export const FARM_GRID = {
  width: 8,
  height: 6,
  cellSize: 80
};