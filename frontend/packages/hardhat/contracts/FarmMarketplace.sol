// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FarmCoin.sol";
import "./PlantNFT.sol";
import "./CropNFT.sol";
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
    CropNFT public cropNFT;
    FarmLand public farmLand;
    GameEvents public gameEvents;
    GameEffects public gameEffects;
    PriceOracle public priceOracle;
    
    // Shop inventory
    mapping(PriceOracle.SeedType => uint256) public seedInventory;
    
    event SeedPurchased(address indexed buyer, PriceOracle.SeedType seedType, uint256 quantity, uint256 totalCost);
    event PlantPlanted(address indexed farmer, uint256 plantTokenId, uint256 landTokenId);
    event CropHarvested(address indexed farmer, uint256 plantTokenId, uint256 cropNFTId);
    event CropSold(address indexed seller, uint256 cropTokenId, uint256 reward);
    event EventTriggeredAndApplied(uint256 indexed eventId, address indexed farmer);
    
    constructor(
        address initialOwner,
        address _farmCoin,
        address _plantNFT,
        address _cropNFT,
        address _farmLand,
        address _gameEvents,
        address _gameEffects,
        address _priceOracle
    ) Ownable(initialOwner) {
        farmCoin = FarmCoin(_farmCoin);
        plantNFT = PlantNFT(_plantNFT);
        cropNFT = CropNFT(_cropNFT);
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
        PriceOracle.SeedType seedType
    ) external nonReentrant returns (uint256 plantTokenId) {
        
        PlantNFT.PlantType plantType;
        if (seedType == PriceOracle.SeedType.WHEAT_SEED) {
            plantType = PlantNFT.PlantType.WHEAT;
        } else if (seedType == PriceOracle.SeedType.GRAPE_SEED) {
            plantType = PlantNFT.PlantType.GRAPE;
        } else {
            plantType = PlantNFT.PlantType.PUMPKIN;
        }
        
        plantTokenId = plantNFT.mint(msg.sender, plantType, 0);
        
        emit PlantPlanted(msg.sender, plantTokenId, 0);
        
        return plantTokenId;
    }
    
    /**
     * @notice Harvest a mature plant and receive Crop NFT
     */
    function harvestCrop(uint256 plantTokenId) external nonReentrant returns (uint256) {
        require(plantNFT.ownerOf(plantTokenId) == msg.sender, "Not plant owner");
        require(plantNFT.isReadyToHarvest(plantTokenId), "Plant not ready");
        
        PlantNFT.Plant memory plant = plantNFT.getPlant(plantTokenId);
        
        // Map PlantType to CropType
        CropNFT.CropType cropType;
        if (plant.plantType == PlantNFT.PlantType.WHEAT) {
            cropType = CropNFT.CropType.WHEAT;
        } else if (plant.plantType == PlantNFT.PlantType.GRAPE) {
            cropType = CropNFT.CropType.GRAPE;
        } else {
            cropType = CropNFT.CropType.PUMPKIN;
        }
        
        // Отмечаем растение как собранное перед сжиганием
        plantNFT.markAsHarvested(plantTokenId);
        
        // Mint Crop NFT with quality based on plant health
        uint256 cropTokenId = cropNFT.mint(msg.sender, cropType, plant.health);
        
        // Burn plant NFT (растение превращается в урожай)
        plantNFT.burn(plantTokenId);
        
        emit CropHarvested(msg.sender, plantTokenId, cropTokenId);
        
        return cropTokenId;
    }
    
    /**
     * @notice Sell harvested crop for FarmCoin
     */
    function sellCrop(uint256 cropTokenId) external nonReentrant {
        require(cropNFT.ownerOf(cropTokenId) == msg.sender, "Not crop owner");
        
        CropNFT.Crop memory crop = cropNFT.getCrop(cropTokenId);
        
        // Calculate reward based on crop quality
        PriceOracle.CropType oracleCropType;
        if (crop.cropType == CropNFT.CropType.WHEAT) {
            oracleCropType = PriceOracle.CropType.WHEAT;
        } else if (crop.cropType == CropNFT.CropType.GRAPE) {
            oracleCropType = PriceOracle.CropType.GRAPE;
        } else {
            oracleCropType = PriceOracle.CropType.PUMPKIN;
        }
        
        uint256 basePrice = priceOracle.getCropPrice(oracleCropType);
        uint256 reward = (basePrice * crop.quality) / 1000; // Scale by quality (0-1000)
        
        // Mint FarmCoin reward
        farmCoin.mint(msg.sender, reward);
        
        // Burn crop NFT
        cropNFT.burn(cropTokenId);
        
        emit CropSold(msg.sender, cropTokenId, reward);
    }
    
    mapping(address => bool) public hasClaimedStarterLand;
    
    /**
     * @notice Mint initial land plots to a new player (one time only)
     */
    function mintStarterLand() external {
        require(!hasClaimedStarterLand[msg.sender], "Land already claimed");
        hasClaimedStarterLand[msg.sender] = true;
        
        // Mint 8x6 grid (48 plots)
        for (uint8 y = 0; y < 6; y++) {
            for (uint8 x = 0; x < 8; x++) {
                farmLand.mint(msg.sender, x, y);
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
