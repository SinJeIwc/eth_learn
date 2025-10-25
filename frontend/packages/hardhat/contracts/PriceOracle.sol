// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./GameEvents.sol";
import "./GameEffects.sol";

/**
 * @title PriceOracle
 * @notice Dynamic pricing based on events and effects
 * @dev Third contract in the chain reaction
 */
contract PriceOracle is Ownable {
    GameEvents public gameEvents;
    GameEffects public gameEffects;
    
    enum CropType { WHEAT, GRAPE, PUMPKIN }
    enum SeedType { WHEAT_SEED, GRAPE_SEED, PUMPKIN_SEED }
    
    // Base prices in wei (for demo, small values)
    uint256 public constant BASE_WHEAT_SEED = 0.005 ether;
    uint256 public constant BASE_GRAPE_SEED = 0.012 ether;
    uint256 public constant BASE_PUMPKIN_SEED = 0.020 ether;
    
    uint256 public constant BASE_WHEAT_CROP = 0.010 ether;
    uint256 public constant BASE_GRAPE_CROP = 0.025 ether;
    uint256 public constant BASE_PUMPKIN_CROP = 0.045 ether;
    
    // Current price multipliers (1000 = 1.0x, 1500 = 1.5x)
    mapping(CropType => uint256) public cropMultipliers;
    mapping(SeedType => uint256) public seedMultipliers;
    
    // Price history
    struct PriceSnapshot {
        uint256 timestamp;
        uint256 wheatPrice;
        uint256 grapePrice;
        uint256 pumpkinPrice;
    }
    
    PriceSnapshot[] public priceHistory;
    
    event PricesUpdated(
        uint256 indexed eventId,
        uint256 wheatMultiplier,
        uint256 grapeMultiplier,
        uint256 pumpkinMultiplier
    );
    
    constructor(
        address initialOwner,
        address _gameEvents,
        address _gameEffects
    ) Ownable(initialOwner) {
        gameEvents = GameEvents(_gameEvents);
        gameEffects = GameEffects(_gameEffects);
        
        // Initialize at 1.0x
        cropMultipliers[CropType.WHEAT] = 1000;
        cropMultipliers[CropType.GRAPE] = 1000;
        cropMultipliers[CropType.PUMPKIN] = 1000;
        
        seedMultipliers[SeedType.WHEAT_SEED] = 1000;
        seedMultipliers[SeedType.GRAPE_SEED] = 1000;
        seedMultipliers[SeedType.PUMPKIN_SEED] = 1000;
    }
    
    /**
     * @notice Update prices based on recent event
     * @dev Called after effects are applied
     */
    function updatePrices(uint256 eventId) external {
        GameEvents.GameEvent memory gameEvent = gameEvents.getEvent(eventId);
        
        // Calculate price changes based on event type
        (int16 wheatChange, int16 grapeChange, int16 pumpkinChange) = 
            _calculatePriceChanges(gameEvent.eventType, gameEvent.severity);
        
        // Apply changes to multipliers
        cropMultipliers[CropType.WHEAT] = _applyMultiplierChange(
            cropMultipliers[CropType.WHEAT],
            wheatChange
        );
        cropMultipliers[CropType.GRAPE] = _applyMultiplierChange(
            cropMultipliers[CropType.GRAPE],
            grapeChange
        );
        cropMultipliers[CropType.PUMPKIN] = _applyMultiplierChange(
            cropMultipliers[CropType.PUMPKIN],
            pumpkinChange
        );
        
        // Seeds follow crop prices (inverse relationship)
        seedMultipliers[SeedType.WHEAT_SEED] = cropMultipliers[CropType.WHEAT];
        seedMultipliers[SeedType.GRAPE_SEED] = cropMultipliers[CropType.GRAPE];
        seedMultipliers[SeedType.PUMPKIN_SEED] = cropMultipliers[CropType.PUMPKIN];
        
        // Store price snapshot
        priceHistory.push(PriceSnapshot({
            timestamp: block.timestamp,
            wheatPrice: getCropPrice(CropType.WHEAT),
            grapePrice: getCropPrice(CropType.GRAPE),
            pumpkinPrice: getCropPrice(CropType.PUMPKIN)
        }));
        
        emit PricesUpdated(
            eventId,
            cropMultipliers[CropType.WHEAT],
            cropMultipliers[CropType.GRAPE],
            cropMultipliers[CropType.PUMPKIN]
        );
    }
    
    /**
     * @notice Calculate price changes based on event
     * @dev Bad events increase prices (scarcity), good events decrease prices (abundance)
     */
    function _calculatePriceChanges(
        GameEvents.EventType eventType,
        uint16 severity
    ) internal pure returns (int16 wheat, int16 grape, int16 pumpkin) {
        if (eventType == GameEvents.EventType.NONE) {
            // Prices slowly normalize
            return (-5, -5, -5);
        } else if (eventType == GameEvents.EventType.RAIN) {
            // Good harvest -> lower prices
            wheat = -int16(uint16(severity / 20));  // -0 to -50
            grape = -int16(uint16(severity / 25));
            pumpkin = -int16(uint16(severity / 30));
        } else if (eventType == GameEvents.EventType.SUNSTORM) {
            // Excellent harvest -> much lower prices
            wheat = -int16(uint16(severity / 10));  // -0 to -100
            grape = -int16(uint16(severity / 15));
            pumpkin = -int16(uint16(severity / 20));
        } else if (eventType == GameEvents.EventType.LOCUSTS) {
            // Crop damage -> higher prices
            wheat = int16(uint16(severity / 5));    // +0 to +200
            grape = int16(uint16(severity / 7));
            pumpkin = int16(uint16(severity / 10));
        } else if (eventType == GameEvents.EventType.FROST) {
            // Heavy damage -> much higher prices
            wheat = int16(uint16(severity / 3));    // +0 to +333
            grape = int16(uint16(severity / 4));
            pumpkin = int16(uint16(severity / 5));
        } else if (eventType == GameEvents.EventType.DROUGHT) {
            // Moderate damage -> moderate price increase
            wheat = int16(uint16(severity / 6));    // +0 to +166
            grape = int16(uint16(severity / 8));
            pumpkin = int16(uint16(severity / 10));
        } else if (eventType == GameEvents.EventType.WIND || eventType == GameEvents.EventType.PESTS) {
            // Minor damage -> slight price increase
            wheat = int16(uint16(severity / 15));   // +0 to +66
            grape = int16(uint16(severity / 20));
            pumpkin = int16(uint16(severity / 25));
        }
        
        return (wheat, grape, pumpkin);
    }
    
    /**
     * @notice Apply multiplier change (clamped between 0.5x and 2.0x)
     */
    function _applyMultiplierChange(uint256 current, int16 change) internal pure returns (uint256) {
        int32 result = int32(int256(current)) + int32(change);
        if (result < 500) return 500;    // Min 0.5x
        if (result > 2000) return 2000;  // Max 2.0x
        return uint256(uint32(result));
    }
    
    /**
     * @notice Get current seed price
     */
    function getSeedPrice(SeedType seedType) public view returns (uint256) {
        uint256 basePrice;
        if (seedType == SeedType.WHEAT_SEED) basePrice = BASE_WHEAT_SEED;
        else if (seedType == SeedType.GRAPE_SEED) basePrice = BASE_GRAPE_SEED;
        else basePrice = BASE_PUMPKIN_SEED;
        
        return (basePrice * seedMultipliers[seedType]) / 1000;
    }
    
    /**
     * @notice Get current crop sell price
     */
    function getCropPrice(CropType cropType) public view returns (uint256) {
        uint256 basePrice;
        if (cropType == CropType.WHEAT) basePrice = BASE_WHEAT_CROP;
        else if (cropType == CropType.GRAPE) basePrice = BASE_GRAPE_CROP;
        else basePrice = BASE_PUMPKIN_CROP;
        
        return (basePrice * cropMultipliers[cropType]) / 1000;
    }
    
    /**
     * @notice Get all current prices
     */
    function getAllPrices() external view returns (
        uint256 wheatSeed,
        uint256 grapeSeed,
        uint256 pumpkinSeed,
        uint256 wheatCrop,
        uint256 grapeCrop,
        uint256 pumpkinCrop
    ) {
        return (
            getSeedPrice(SeedType.WHEAT_SEED),
            getSeedPrice(SeedType.GRAPE_SEED),
            getSeedPrice(SeedType.PUMPKIN_SEED),
            getCropPrice(CropType.WHEAT),
            getCropPrice(CropType.GRAPE),
            getCropPrice(CropType.PUMPKIN)
        );
    }
    
    /**
     * @notice Get price history
     */
    function getPriceHistory(uint256 count) external view returns (PriceSnapshot[] memory) {
        uint256 total = priceHistory.length;
        if (count > total) count = total;
        
        PriceSnapshot[] memory recent = new PriceSnapshot[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = priceHistory[total - count + i];
        }
        
        return recent;
    }
}
