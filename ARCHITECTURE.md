# Farm Game Architecture

## Smart Contracts (Status Network Sepolia)

### Core Contracts

- **FarmCoin** (ERC20): 0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00
- **PlantNFT** (ERC721): Plant tokens
- **CropNFT** (ERC721): Harvested crop tokens
- **FarmLand** (ERC721): Land plot tokens
- **FarmMarketplace**: Main game logic
- **FarmCoinFaucet**: 0xFD471836031dc5108809D173A067e8486B9047A3

### Game Flow

**Current (without CropNFT):**

```
1. New Player
   └─> FarmCoinFaucet.claimStarterTokens() → Get 50 FarmCoin (once per address)

2. Buy Seeds
   └─> FarmMarketplace.buySeed(seedType, quantity) → Burns FarmCoin

3. Plant
   └─> FarmMarketplace.plantSeed(seedType, landId) → Mints PlantNFT

4. Harvest
   └─> FarmMarketplace.harvestCrop(plantId) → Burns PlantNFT, Mints FarmCoin (instant)
```

**Planned (with CropNFT - needs deployment):**

```
4. Harvest
   └─> FarmMarketplace.harvestCrop(plantId) → Burns PlantNFT, Mints CropNFT

5. Sell
   └─> FarmMarketplace.sellCrop(cropId) → Burns CropNFT, Mints FarmCoin
```

## Frontend Architecture

### Key Hooks

- `usePlayerInit`: Check balance, detect new players
- `useFarmContracts`: Blockchain interactions
- No local state (100% blockchain)

### Components

- `FarmGame`: Main game UI
- `FarmGrid`: Farm visualization
- No Xsolla (removed)
- RainbowKit wallet auth

## Network

- **Chain**: Status Network Sepolia
- **Chain ID**: 1660990954
- **Gasless**: Yes (L2)

## Token Economy

- FarmCoin decimals: 18
- Starter amount: 50 FarmCoin
- All transactions on-chain
- NFT-based crop system
