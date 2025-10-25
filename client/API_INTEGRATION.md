# Farm Game - API Integration

## Overview

The game now works with JSON API responses for inventory and shop data, simulating a real backend integration.

## API Structure

### Inventory API (`/config/inventory.json`)

```json
{
  "items": [
    {
      "sku": "seed_grape",
      "type": "virtual_good",
      "name": "Grape Seeds",
      "quantity": 2,
      "description": "...",
      "image_url": "/Plants/grape/seed.png"
    }
  ]
}
```

### Shop API (`/config/shop.json`)

```json
{
  "items": [
    {
      "sku": "seed_wheat",
      "name": { "en": "Wheat Seeds" },
      "description": { "en": "..." },
      "image_url": "/Plants/wheat/seed.png",
      "type": "virtual_good",
      "price": {
        "amount": "10",
        "currency": "USD"
      },
      "limits": {
        "per_user": {
          "total": 10,
          "available": 7
        }
      }
    }
  ]
}
```

## New Architecture

### API Service Layer (`services/api.ts`)

- **`fetchInventory()`** - Loads inventory from JSON
- **`fetchShop()`** - Loads shop data from JSON
- **`convertInventoryResponse()`** - Converts API format to internal format
- **`convertShopResponse()`** - Converts shop API to internal format
- **`saveInventoryToStorage()`** - Persists inventory to localStorage
- **`saveShopToStorage()`** - Persists shop to localStorage

### Type System (`types/api.ts`)

- **API Response Types**: `InventoryResponse`, `ShopResponse`, `InventoryItemAPI`, `ShopItemAPI`
- **Internal Game Types**: `Item`, `InventoryItem`, `PlantedCrop`, `ShopItem`
- **Plant Mappings**: `PLANT_TYPES`, `GROWTH_TIMES`, `SELL_PRICES`

### Game State Hook (`hooks/useGameState.ts`)

- Loads data from API on first mount
- Caches data in localStorage for subsequent loads
- Automatically saves changes to localStorage
- Provides loading state during API fetch

### Plant Animation

**Old System:**

- Multi-frame sprite sheet animation
- Complex frame calculation
- Background position manipulation

**New System:**

- Simple loading overlay on seed image
- White transparent layer fills from bottom to top
- Shows percentage completion
- Displays fetus image when ready

Animation stages:

1. **Growing**: Seed image + white overlay with green fill (0-100%)
2. **Ready**: Fetus image + yellow pulse indicator

## Data Flow

```
1. App Starts
   ↓
2. useGameState → fetchInventory() + fetchShop()
   ↓
3. Convert API Response → Internal Format
   ↓
4. Save to localStorage
   ↓
5. Render UI Components
   ↓
6. User Actions → Update State
   ↓
7. Auto-save to localStorage
```

## Benefits

✅ **Realistic API Integration**: Simulates real backend  
✅ **Type-Safe Conversion**: API types ↔ Internal types  
✅ **Offline Support**: localStorage caching  
✅ **Loading States**: UX feedback during data load  
✅ **Simple Animation**: No complex sprite logic  
✅ **Clear Progress**: Percentage indicator during growth

## SKU Naming Convention

- **Seeds**: `seed_{plant_type}` (e.g., `seed_wheat`)
- **Crops**: `fetus_{plant_type}` (e.g., `fetus_wheat`)

## Growth System

- Seeds are planted on grid
- Progress bar shows growth (0-100%)
- White overlay gradually fades as plant grows
- When complete (100%), fetus image appears
- Ready indicator pulses for harvesting
