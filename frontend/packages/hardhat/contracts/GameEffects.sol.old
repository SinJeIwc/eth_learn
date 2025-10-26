// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./GameEvents.sol";
import "./PlantNFT.sol";
import "./FarmLand.sol";

/**
 * @title GameEffects
 * @notice Applies event effects to plants and land
 * @dev Second contract in the chain reaction (called after GameEvents)
 */
contract GameEffects is Ownable {
    PlantNFT public plantNFT;
    FarmLand public farmLand;
    GameEvents public gameEvents;
    
    // Next contract in chain (PriceOracle)
    address public priceOracle;
    
    struct EffectResult {
        int16 healthChange;     // -1000 to +1000
        int16 fertilityChange;  // -1000 to +1000
        uint16 affectedPlants;
        uint16 affectedLand;
    }
    
    event EffectsApplied(
        uint256 indexed eventId,
        int16 avgHealthChange,
        int16 avgFertilityChange,
        uint16 affectedPlants,
        uint16 affectedLand
    );
    
    constructor(
        address initialOwner,
        address _plantNFT,
        address _farmLand,
        address _gameEvents
    ) Ownable(initialOwner) {
        plantNFT = PlantNFT(_plantNFT);
        farmLand = FarmLand(_farmLand);
        gameEvents = GameEvents(_gameEvents);
    }
    
    /**
     * @notice Set price oracle contract
     */
    function setPriceOracle(address _priceOracle) external onlyOwner {
        priceOracle = _priceOracle;
    }
    
    /**
     * @notice Apply effects to a player's farm based on event
     * @dev Called automatically after event is triggered
     */
    function applyEffects(
        uint256 eventId,
        address farmer
    ) external returns (EffectResult memory) {
        GameEvents.GameEvent memory gameEvent = gameEvents.getEvent(eventId);
        
        // Get farmer's land plots
        uint256[] memory landTokenIds = farmLand.getLandsByOwner(farmer);
        
        EffectResult memory result = EffectResult({
            healthChange: 0,
            fertilityChange: 0,
            affectedPlants: 0,
            affectedLand: 0
        });
        
        // Apply effects based on event type
        (int16 healthMod, int16 fertilityMod) = _calculateModifiers(
            gameEvent.eventType,
            gameEvent.severity
        );
        
        // Apply to all farmer's land plots
        for (uint256 i = 0; i < landTokenIds.length; i++) {
            uint256 landId = landTokenIds[i];
            FarmLand.LandPlot memory plot = farmLand.getLandPlot(landId);
            
            // Update land fertility
            uint16 newFertility = _applyChange(plot.fertility, fertilityMod);
            farmLand.updateFertility(landId, newFertility);
            result.affectedLand++;
            result.fertilityChange += fertilityMod;
        }
        
        // TODO: Apply to plants on these land plots
        // For now, simplified version without tracking plant-land mapping
        
        emit EffectsApplied(
            eventId,
            healthMod,
            fertilityMod,
            result.affectedPlants,
            result.affectedLand
        );
        
        return result;
    }
    
    /**
     * @notice Apply effect to a specific plant
     */
    function applyEffectToPlant(uint256 plantTokenId, uint256 eventId) external {
        require(plantNFT.ownerOf(plantTokenId) == msg.sender, "Not plant owner");
        
        GameEvents.GameEvent memory gameEvent = gameEvents.getEvent(eventId);
        PlantNFT.Plant memory plant = plantNFT.getPlant(plantTokenId);
        
        (int16 healthMod, ) = _calculateModifiers(
            gameEvent.eventType,
            gameEvent.severity
        );
        
        // Apply health change
        uint16 newHealth = _applyChange(plant.health, healthMod);
        plantNFT.updateHealth(plantTokenId, newHealth);
    }
    
    /**
     * @notice Calculate modifiers based on event type and severity
     */
    function _calculateModifiers(
        GameEvents.EventType eventType,
        uint16 severity
    ) internal pure returns (int16 healthMod, int16 fertilityMod) {
        if (eventType == GameEvents.EventType.NONE) {
            return (0, 0);
        } else if (eventType == GameEvents.EventType.RAIN) {
            // Positive effect
            healthMod = int16(uint16(severity / 5));  // +0 to +200
            fertilityMod = int16(uint16(severity / 10)); // +0 to +100
        } else if (eventType == GameEvents.EventType.SUNSTORM) {
            // Very positive
            healthMod = int16(uint16(severity / 3));  // +0 to +333
            fertilityMod = int16(uint16(severity / 5)); // +0 to +200
        } else if (eventType == GameEvents.EventType.LOCUSTS) {
            // Heavy damage
            healthMod = -int16(uint16(severity / 2));  // -0 to -500
            fertilityMod = -int16(uint16(severity / 4)); // -0 to -250
        } else if (eventType == GameEvents.EventType.FROST) {
            // Very heavy damage
            healthMod = -int16(uint16((severity * 7) / 10));  // -0 to -700
            fertilityMod = -int16(uint16(severity / 3)); // -0 to -333
        } else if (eventType == GameEvents.EventType.DROUGHT) {
            // Moderate damage
            healthMod = -int16(uint16(severity / 3));  // -0 to -333
            fertilityMod = -int16(uint16(severity / 5)); // -0 to -200
        } else if (eventType == GameEvents.EventType.WIND) {
            // Minor damage
            healthMod = -int16(uint16(severity / 5));  // -0 to -200
            fertilityMod = -int16(uint16(severity / 10)); // -0 to -100
        } else if (eventType == GameEvents.EventType.PESTS) {
            // Moderate damage
            healthMod = -int16(uint16(severity / 4));  // -0 to -250
            fertilityMod = -int16(uint16(severity / 6)); // -0 to -166
        }
        
        return (healthMod, fertilityMod);
    }
    
    /**
     * @notice Apply change to a value (0-1000 range)
     */
    function _applyChange(uint16 current, int16 change) internal pure returns (uint16) {
        int32 result = int32(int16(current)) + int32(change);
        if (result < 0) return 0;
        if (result > 1000) return 1000;
        return uint16(uint32(result));
    }
}
