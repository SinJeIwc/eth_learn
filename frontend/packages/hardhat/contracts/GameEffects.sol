// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PlantNFT.sol";

interface IPriceOracle {
    function setWheatMultiplier(uint256 multiplier) external;
}

contract GameEffects is Ownable {
    PlantNFT public plantNFT;
    IPriceOracle public priceOracle;
    
    mapping(address => uint256) public lastEventProcessed;
    uint256 public constant TIME_REDUCTION = 10 minutes; // Уменьшение времени роста при дожде
    
    event RainApplied(uint256 plantsAffected, uint256 timeReduced);
    event DroughtApplied(uint256 wheatPriceMultiplier);
    event WinterApplied(address indexed farmer, uint256 plantsDied, uint256 plantsTotal);
    
    constructor(
        address initialOwner,
        address _plantNFT,
        address _priceOracle
    ) Ownable(initialOwner) {
        plantNFT = PlantNFT(_plantNFT);
        priceOracle = IPriceOracle(_priceOracle);
    }
    
    function applyEventEffects(uint8 eventType, uint16 severity) external {
        if (eventType == 1) {
            _applyRain();
        } else if (eventType == 2) {
            _applyDrought();
        } else if (eventType == 3) {
            _applyWinter(severity);
        }
    }
    
    function _applyRain() internal {
        // Дождь автоматически уменьшает время роста всех активных растений
        uint256 totalSupply = plantNFT.totalSupply();
        uint256 affectedCount = 0;
        
        for (uint256 i = 0; i < totalSupply; i++) {
            uint256 tokenId = plantNFT.tokenByIndex(i);
            PlantNFT.Plant memory plant = plantNFT.getPlant(tokenId);
            
            // Применяем только к растущим растениям (не собранным)
            if (!plant.isHarvested) {
                plantNFT.reduceGrowthTime(tokenId, TIME_REDUCTION);
                affectedCount++;
            }
        }
        
        emit RainApplied(affectedCount, TIME_REDUCTION);
    }
    
    function _applyDrought() internal {
        priceOracle.setWheatMultiplier(2);
        emit DroughtApplied(2);
    }
    
    function _applyWinter(uint16 severity) internal {
        uint256 killPercent = 10 + (severity * 40 / 1000);
        emit WinterApplied(msg.sender, 0, killPercent);
    }
    
    // Эта функция больше не нужна - дождь применяется автоматически
    // Оставляем для совместимости, но она ничего не делает
    function applyRainToPlant(uint256 plantTokenId) external view {
        PlantNFT.Plant memory plant = plantNFT.getPlant(plantTokenId);
        require(plant.owner == msg.sender, "Not plant owner");
        // Дождь уже применен автоматически при вызове события
    }
    
    function applyWinterToFarmer(address farmer) external {
        uint256[] memory plantIds = plantNFT.getPlantsByOwner(farmer);
        
        if (plantIds.length == 0) return;
        
        uint256 random = uint256(
            keccak256(abi.encodePacked(block.timestamp, farmer, block.prevrandao))
        );
        
        uint256 killPercent = 10 + (random % 41);
        uint256 toKill = (plantIds.length * killPercent) / 100;
        
        for (uint256 i = 0; i < toKill && i < plantIds.length; i++) {
            plantNFT.burn(plantIds[i]);
        }
        
        emit WinterApplied(farmer, toKill, plantIds.length);
    }
}
