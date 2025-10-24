# Farm Game - Clean Architecture

## Project Structure

```
client/src/
├── components/          # UI Components
│   ├── FarmGame.tsx    # Main game component (orchestration)
│   ├── FarmGrid.tsx    # Farm grid rendering
│   ├── AnimatedPlant.tsx  # Plant sprite animation
│   ├── InventoryModal.tsx # Inventory UI
│   ├── ShopModal.tsx   # Shop UI
│   └── SafeImage.tsx   # Image with error handling
├── hooks/              # Custom React Hooks
│   ├── useFarmLogic.ts # Farm game business logic
│   └── useGameState.ts # Global game state management
├── lib/                # Utilities
│   ├── constants.ts    # Configuration & constants
│   └── utils.ts        # Helper functions
└── types/              # TypeScript types
    └── farm.ts         # Game data types & mock data
```

## Architecture Principles

### 1. **Separation of Concerns**

- **Components**: Focus on UI rendering and user interactions
- **Hooks**: Encapsulate business logic and state management
- **Utils**: Pure functions for data transformation
- **Types**: Centralized type definitions

### 2. **Component Decomposition**

- **FarmGame** (Orchestrator): Coordinates modals, grid, and state
- **FarmGrid** (Presenter): Renders grid cells and plants
- **AnimatedPlant** (Atomic): Self-contained plant animation
- **Modals** (Feature): Independent inventory/shop features

### 3. **Single Responsibility**

- Each component has one clear purpose
- Business logic extracted from UI components
- Reusable utilities for common operations

### 4. **Configuration Over Code**

- Constants defined in `constants.ts`
- Easy to modify game parameters
- Type-safe configuration

## Key Components

### FarmGame

Main orchestrator component that:

- Manages modal visibility
- Displays header with coins/buttons
- Shows selected seed info
- Renders farm grid

### useFarmLogic Hook

Encapsulates all game logic:

- Planting seeds on grid
- Harvesting crops
- Buying from shop
- Selling crops
- Growth timer updates

### SafeImage

Robust image component:

- URL validation before rendering
- Automatic format fallback (png ↔ jpg)
- Graceful error handling
- Prevents Next.js crashes

### AnimatedPlant

Sprite-based animation:

- Frame calculation from progress
- CSS sprite positioning
- Ready state indicator
- Progress bar display

## Data Flow

```
User Action → FarmGame → useFarmLogic → useGameState → localStorage
                ↓
         Re-render UI Components
```

## Benefits of Refactoring

✅ **Readable**: Clear component hierarchy and naming  
✅ **Maintainable**: Easy to find and modify code  
✅ **Testable**: Separated logic from UI  
✅ **Scalable**: Easy to add new features  
✅ **Type-Safe**: Full TypeScript coverage  
✅ **DRY**: No code duplication  
✅ **Predictable**: Clear data flow
