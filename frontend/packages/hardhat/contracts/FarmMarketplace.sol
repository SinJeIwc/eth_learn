// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FarmCoin.sol";
import "./PlantNFT.sol";
import "./FarmLand.sol";
import "./GameEvents.sol";
import "./GameEffects.sol";
import "./PriceOracle.sol";

/**
 * @title FarmMarketplace
 * @notice Main marketplace for buying seeds, planting, harvesting, and selling crops
 * @dev Orchestrates the entire chain reaction: Buy -> Plant -> Event -> Effect -> Price Change
 */
contract FarmMarketplace is Ownable, ReentrancyGuard {
    FarmCoin public farmCoin;
    PlantNFT public plantNFT;
    FarmLand public farmLand;
    GameEvents public gameEvents;
    GameEffects public gameEffects;
    PriceOracle public priceOracle;
    
    // Shop inventory
    mapping(PriceOracle.SeedType => uint256) public seedInventory;
    
    event SeedPurchased(address indexed buyer, PriceOracle.SeedType seedType, uint256 quantity, uint256 totalCost);
    event PlantPlanted(address indexed farmer, uint256 plantTokenId, uint256 landTokenId);
    event CropHarvested(address indexed farmer, uint256 plantTokenId, uint256 reward);
    event CropSold(address indexed seller, PlantNFT.PlantType cropType, uint256 quantity, uint256 totalEarned);
    event EventTriggeredAndApplied(uint256 indexed eventId, address indexed farmer);
    
    constructor(
        address initialOwner,
        address _farmCoin,
        address _plantNFT,
        address _farmLand,
        address _gameEvents,
        address _gameEffects,
        address _priceOracle
    ) Ownable(initialOwner) {
        farmCoin = FarmCoin(_farmCoin);
        plantNFT = PlantNFT(_plantNFT);
        farmLand = FarmLand(_farmLand);
        gameEvents = GameEvents(_gameEvents);
        gameEffects = GameEffects(_gameEffects);
        priceOracle = PriceOracle(_priceOracle);
        
        // Initialize shop inventory (unlimited for demo)
        seedInventory[PriceOracle.SeedType.WHEAT_SEED] = type(uint256).max;
        seedInventory[PriceOracle.SeedType.GRAPE_SEED] = type(uint256).max;
        seedInventory[PriceOracle.SeedType.PUMPKIN_SEED] = type(uint256).max;
    }
    
    /**
     * @notice Buy seeds from shop using FarmCoin
     */
    function buySeed(PriceOracle.SeedType seedType, uint256 quantity) external nonReentrant {
        require(quantity > 0, "Invalid quantity");
        require(seedInventory[seedType] >= quantity, "Insufficient inventory");
        
        uint256 pricePerSeed = priceOracle.getSeedPrice(seedType);
        uint256 totalCost = pricePerSeed * quantity;
        
        // Burn FarmCoin from buyer
        farmCoin.burnFrom(msg.sender, totalCost);
        
        // Update inventory
        seedInventory[seedType] -= quantity;
        
        emit SeedPurchased(msg.sender, seedType, quantity, totalCost);
        
        // TODO: Track seeds in user's inventory (off-chain or separate contract)
    }
    
    /**
     * @notice Plant a seed on owned land
     */
    function plantSeed(
        PriceOracle.SeedType seedType,
        uint256 landTokenId
    ) external nonReentrant returns (uint256 plantTokenId) {
        require(farmLand.ownerOf(landTokenId) == msg.sender, "Not land owner");
        
        // Convert seed type to plant type
        PlantNFT.PlantType plantType;
        if (seedType == PriceOracle.SeedType.WHEAT_SEED) {
            plantType = PlantNFT.PlantType.WHEAT;
        } else if (seedType == PriceOracle.SeedType.GRAPE_SEED) {
            plantType = PlantNFT.PlantType.GRAPE;
        } else {
            plantType = PlantNFT.PlantType.PUMPKIN;
        }
        
        // Mint plant NFT
        plantTokenId = plantNFT.mint(msg.sender, plantType, landTokenId);
        
        emit PlantPlanted(msg.sender, plantTokenId, landTokenId);
        
        return plantTokenId;
    }
    
    /**
     * @notice Harvest a mature plant
     */
    function harvestCrop(uint256 plantTokenId) external nonReentrant {
        require(plantNFT.ownerOf(plantTokenId) == msg.sender, "Not plant owner");
        require(plantNFT.isReadyToHarvest(plantTokenId), "Plant not ready");
        
        PlantNFT.Plant memory plant = plantNFT.getPlant(plantTokenId);
        
        // Calculate reward based on health
        PriceOracle.CropType cropType;
        if (plant.plantType == PlantNFT.PlantType.WHEAT) {
            cropType = PriceOracle.CropType.WHEAT;
        } else if (plant.plantType == PlantNFT.PlantType.GRAPE) {
            cropType = PriceOracle.CropType.GRAPE;
        } else {
            cropType = PriceOracle.CropType.PUMPKIN;
        }
        
        uint256 baseReward = priceOracle.getCropPrice(cropType);
        uint256 reward = (baseReward * plant.health) / 1000; // Scale by health
        
        // Mint FarmCoin reward
        farmCoin.mint(msg.sender, reward);
        
        // Burn plant NFT
        plantNFT.burn(plantTokenId);
        
        emit CropHarvested(msg.sender, plantTokenId, reward);
    }
    
    /**
     * @notice Trigger random event and apply effects (CHAIN REACTION STARTS HERE!)
     * @dev Anyone can trigger events, but effects apply to their own farm
     */
    function triggerRandomEvent() external nonReentrant {
        // 1️⃣ STEP 1: Generate random event
        uint256 eventId = gameEvents.triggerEvent();
        
        // 2️⃣ STEP 2: Apply effects to caller's farm
        gameEffects.applyEffects(eventId, msg.sender);
        
        // 3️⃣ STEP 3: Update market prices
        priceOracle.updatePrices(eventId);
        
        emit EventTriggeredAndApplied(eventId, msg.sender);
    }
    
    /**
     * @notice Mint initial land plots to a new player
     */
    function mintStarterLand(address player) external onlyOwner {
        // Mint 8x6 grid (48 plots)
        for (uint8 y = 0; y < 6; y++) {
            for (uint8 x = 0; x < 8; x++) {
                farmLand.mint(player, x, y);
            }
        }
    }
    
    /**
     * @notice Give starter coins to new players
     */
    function giveStarterCoins(address player, uint256 amount) external onlyOwner {
        farmCoin.mint(player, amount);
    }
    
    /**
     * @notice Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @notice Get player's farm status
     */
    function getPlayerStatus(address player) external view returns (
        uint256 coinBalance,
        uint256 landCount,
        uint256[] memory landTokenIds
    ) {
        coinBalance = farmCoin.balanceOf(player);
        landTokenIds = farmLand.getLandsByOwner(player);
        landCount = landTokenIds.length;
        
        return (coinBalance, landCount, landTokenIds);
    }
    
    receive() external payable {}
}
