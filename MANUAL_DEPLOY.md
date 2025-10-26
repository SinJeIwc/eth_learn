# Manual Deployment via Remix IDE

## Step 1: Deploy CropNFT

1. Go to https://remix.ethereum.org/
2. Create new file `CropNFT.sol`
3. Copy contract from: `/frontend/packages/hardhat/contracts/CropNFT.sol`
4. Compile with Solidity 0.8.20
5. Deploy to Status Sepolia:
   - Network: Status Sepolia (Chain ID: 1660990954)
   - RPC: https://rpc.statusim.net
   - Constructor: Your wallet address as owner
   - Deploy and save address

## Step 2: Update FarmMarketplace

### Option A: Upgrade existing contract (if upgradeable)

Not applicable - contract is not upgradeable

### Option B: Deploy new FarmMarketplace

1. Open `FarmMarketplace.sol` in Remix
2. Deploy with parameters:

   - initialOwner: Your address
   - \_farmCoin: 0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00
   - \_plantNFT: (existing PlantNFT address)
   - \_cropNFT: (NEW CropNFT address from Step 1)
   - \_farmLand: (existing FarmLand address)
   - \_gameEvents: (existing address)
   - \_gameEffects: (existing address)
   - \_priceOracle: (existing address)

3. After deployment, call these functions:
   ```
   CropNFT.setAuthorizedMinter(newFarmMarketplaceAddress, true)
   FarmCoin.setAuthorizedMinter(newFarmMarketplaceAddress, true)
   PlantNFT.setAuthorizedManager(newFarmMarketplaceAddress, true)
   ```

## Step 3: Update deployedContracts.ts

Add CropNFT and update FarmMarketplace address manually in:
`/frontend/packages/nextjs/contracts/deployedContracts.ts`

## Existing Contracts on Status Sepolia

- FarmCoin: 0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00
- PlantNFT: 0x36C02dA8a0c0148953f89c16b84531278689e8A8
- FarmLand: 0xbf7Fe1242DF516cC7B38B4C4b1ca0c56E1691b83
- Old FarmMarketplace: (to be replaced)

Use your MetaMask with Status Sepolia network to deploy!
