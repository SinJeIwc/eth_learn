import {
  InventoryResponse,
  ShopResponse,
  InventoryItemAPI,
  ShopItemAPI,
  Item,
  InventoryItem,
  ShopItem,
  PLANT_TYPES,
  GROWTH_TIMES,
  SELL_PRICES,
} from "@/types/api";

/**
 * Fetches inventory data from JSON file
 */
export async function fetchInventory(): Promise<InventoryResponse> {
  const response = await fetch("/config/inventory.json");
  if (!response.ok) {
    throw new Error("Failed to fetch inventory");
  }
  return response.json();
}

/**
 * Fetches shop data from JSON file
 */
export async function fetchShop(): Promise<ShopResponse> {
  const response = await fetch("/config/shop.json");
  if (!response.ok) {
    throw new Error("Failed to fetch shop");
  }
  return response.json();
}

/**
 * Converts API inventory item to internal Item format
 */
function convertInventoryItemToItem(apiItem: InventoryItemAPI): Item {
  const isSeed = apiItem.sku.startsWith("seed_");
  const plantType = PLANT_TYPES[apiItem.sku as keyof typeof PLANT_TYPES];

  return {
    id: apiItem.sku,
    name: apiItem.name,
    type: isSeed ? "seed" : "crop",
    description: apiItem.description,
    price: 0, // Seeds in inventory don't have price
    sellPrice: isSeed
      ? undefined
      : SELL_PRICES[apiItem.sku as keyof typeof SELL_PRICES],
    growthTime: isSeed ? GROWTH_TIMES[plantType as keyof typeof GROWTH_TIMES] : 0,
    icon: apiItem.image_url,
  };
}

/**
 * Converts API shop item to internal Item format
 */
function convertShopItemToItem(apiItem: ShopItemAPI): Item {
  const plantType = PLANT_TYPES[apiItem.sku as keyof typeof PLANT_TYPES];

  return {
    id: apiItem.sku,
    name: apiItem.name.en,
    type: "seed", // Shop only sells seeds
    description: apiItem.description.en,
    price: parseFloat(apiItem.price.amount),
    sellPrice: undefined,
    growthTime: GROWTH_TIMES[plantType as keyof typeof GROWTH_TIMES],
    icon: apiItem.image_url,
  };
}

/**
 * Converts API inventory response to internal format
 */
export function convertInventoryResponse(
  response: InventoryResponse
): InventoryItem[] {
  return response.items.map((apiItem) => ({
    item: convertInventoryItemToItem(apiItem),
    quantity: apiItem.quantity,
  }));
}

/**
 * Converts API shop response to internal format
 */
export function convertShopResponse(response: ShopResponse): ShopItem[] {
  return response.items.map((apiItem) => ({
    item: convertShopItemToItem(apiItem),
    stock: apiItem.limits.per_user.available,
    available: apiItem.limits.per_user.available > 0,
  }));
}

/**
 * Saves inventory to localStorage (simulating API update)
 */
export function saveInventoryToStorage(inventory: InventoryItem[]): void {
  const apiFormat: InventoryResponse = {
    items: inventory.map((invItem) => ({
      sku: invItem.item.id,
      type: "virtual_good",
      name: invItem.item.name,
      quantity: invItem.quantity,
      description: invItem.item.description,
      image_url: invItem.item.icon,
    })),
  };
  localStorage.setItem("inventory", JSON.stringify(apiFormat));
}

/**
 * Saves shop to localStorage (simulating API update)
 */
export function saveShopToStorage(shopItems: ShopItem[]): void {
  const apiFormat: ShopResponse = {
    items: shopItems.map((shopItem) => ({
      sku: shopItem.item.id,
      name: { en: shopItem.item.name },
      description: { en: shopItem.item.description },
      image_url: shopItem.item.icon,
      type: "virtual_good",
      price: {
        amount: shopItem.item.price.toString(),
        amount_without_discount: shopItem.item.price.toString(),
        currency: "USD",
      },
      limits: {
        per_user: {
          total: shopItem.stock + 10, // Arbitrary total
          available: shopItem.stock,
        },
      },
    })),
  };
  localStorage.setItem("shop", JSON.stringify(apiFormat));
}

/**
 * Xsolla User API Types
 */
export interface XsollaUserProfileResponse {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  registered?: string;
  last_login?: string;
  external_id?: string;
}

/**
 * Fetches Xsolla user by ID (simulated API call)
 * In production, this would call Xsolla's User Account API
 */
export async function fetchXsollaUserById(userId: string, token: string): Promise<XsollaUserProfileResponse | null> {
  try {
    // Simulated API call - in production, this would be:
    // GET https://login.xsolla.com/api/users/{user_id}
    // Headers: Authorization: Bearer {token}
    
    // For demo purposes, return mock data based on stored user data
    const storedData = localStorage.getItem('xsolla_user_data');
    if (storedData) {
      const userData = JSON.parse(storedData);
      return {
        id: userId,
        username: userData.username,
        email: userData.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=random`,
        registered: new Date().toISOString(),
        last_login: new Date().toISOString(),
        external_id: userId,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch Xsolla user:', error);
    return null;
  }
}

/**
 * Fetches current user profile from Xsolla (simulated)
 * In production: GET https://login.xsolla.com/api/users/me
 */
export async function fetchCurrentXsollaUser(token: string): Promise<XsollaUserProfileResponse | null> {
  try {
    const storedData = localStorage.getItem('xsolla_user_data');
    if (storedData) {
      const userData = JSON.parse(storedData);
      const userId = `xsolla_${userData.username}_${Date.now()}`;
      
      return {
        id: userId,
        username: userData.username,
        email: userData.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=random`,
        registered: new Date().toISOString(),
        last_login: new Date().toISOString(),
        external_id: userId,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch current Xsolla user:', error);
    return null;
  }
}

/**
 * Updates Xsolla user attributes (simulated)
 * In production: PATCH https://login.xsolla.com/api/users/me/update
 */
export async function updateXsollaUserAttributes(
  token: string,
  attributes: Record<string, string>
): Promise<boolean> {
  try {
    // Simulated update - store in localStorage
    const storedData = localStorage.getItem('xsolla_user_data');
    if (storedData) {
      const userData = JSON.parse(storedData);
      const updatedData = { ...userData, ...attributes };
      localStorage.setItem('xsolla_user_data', JSON.stringify(updatedData));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update Xsolla user attributes:', error);
    return false;
  }
}

