// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlantNFT
 * @notice ERC721 NFT representing planted crops
 * @dev Each plant has type, growth stage, health, and planted timestamp
 */
contract PlantNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    
    enum PlantType { WHEAT, GRAPE, PUMPKIN }
    
    struct Plant {
        PlantType plantType;
        uint8 growthStage;      // 0-3 (seed -> mature)
        uint16 health;          // 0-1000
        uint256 plantedAt;      // timestamp
        uint256 landTokenId;    // which land plot it's on
    }
    
    mapping(uint256 => Plant) public plants;
    mapping(address => bool) public authorizedManagers;
    
    event PlantCreated(uint256 indexed tokenId, address indexed owner, PlantType plantType, uint256 landTokenId);
    event PlantGrown(uint256 indexed tokenId, uint8 newStage);
    event PlantHealthChanged(uint256 indexed tokenId, uint16 newHealth);
    event ManagerAuthorized(address indexed manager, bool authorized);
    
    constructor(address initialOwner) 
        ERC721("Farm Plant", "PLANT") 
        Ownable(initialOwner)
    {}
    
    modifier onlyAuthorized() {
        require(authorizedManagers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    /**
     * @notice Authorize a contract to manage plants
     */
    function setAuthorizedManager(address manager, bool authorized) external onlyOwner {
        authorizedManagers[manager] = authorized;
        emit ManagerAuthorized(manager, authorized);
    }
    
    /**
     * @notice Mint a new plant NFT
     */
    function mint(
        address to,
        PlantType plantType,
        uint256 landTokenId
    ) external onlyAuthorized returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        plants[tokenId] = Plant({
            plantType: plantType,
            growthStage: 0,
            health: 1000,
            plantedAt: block.timestamp,
            landTokenId: landTokenId
        });
        
        emit PlantCreated(tokenId, to, plantType, landTokenId);
        return tokenId;
    }
    
    /**
     * @notice Update plant growth stage
     */
    function updateGrowthStage(uint256 tokenId, uint8 newStage) external onlyAuthorized {
        require(newStage <= 3, "Invalid growth stage");
        plants[tokenId].growthStage = newStage;
        emit PlantGrown(tokenId, newStage);
    }
    
    /**
     * @notice Update plant health (called by FarmEffects contract)
     */
    function updateHealth(uint256 tokenId, uint16 newHealth) external onlyAuthorized {
        require(newHealth <= 1000, "Health exceeds max");
        plants[tokenId].health = newHealth;
        emit PlantHealthChanged(tokenId, newHealth);
    }
    
    /**
     * @notice Burn plant NFT (when harvested)
     */
    function burn(uint256 tokenId) external onlyAuthorized {
        _burn(tokenId);
        delete plants[tokenId];
    }
    
    /**
     * @notice Get plant info
     */
    function getPlant(uint256 tokenId) external view returns (Plant memory) {
        return plants[tokenId];
    }
    
    /**
     * @notice Check if plant is ready to harvest
     */
    function isReadyToHarvest(uint256 tokenId) external view returns (bool) {
        Plant memory plant = plants[tokenId];
        
        // Growth time in seconds
        uint256 requiredTime;
        if (plant.plantType == PlantType.WHEAT) {
            requiredTime = 15; // 15 seconds for demo
        } else if (plant.plantType == PlantType.GRAPE) {
            requiredTime = 25;
        } else {
            requiredTime = 35;
        }
        
        return (block.timestamp >= plant.plantedAt + requiredTime) && 
               (plant.growthStage >= 3) &&
               (plant.health > 0);
    }
}
