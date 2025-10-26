// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceOracle is Ownable {
    enum CropType { WHEAT, GRAPE, PUMPKIN }
    enum SeedType { WHEAT_SEED, GRAPE_SEED, PUMPKIN_SEED }
    
    // Цены в FarmCoin токенах (с учетом 18 decimals)
    uint256 public constant BASE_WHEAT_SEED = 5 * 10**18;      // 5 FarmCoin
    uint256 public constant BASE_GRAPE_SEED = 12 * 10**18;     // 12 FarmCoin
    uint256 public constant BASE_PUMPKIN_SEED = 15 * 10**18;   // 15 FarmCoin
    
    uint256 public constant BASE_WHEAT_CROP = 15 * 10**18;     // 15 FarmCoin
    uint256 public constant BASE_GRAPE_CROP = 30 * 10**18;     // 30 FarmCoin
    uint256 public constant BASE_PUMPKIN_CROP = 40 * 10**18;   // 40 FarmCoin
    
    mapping(CropType => uint256) public cropMultipliers;
    mapping(SeedType => uint256) public seedMultipliers;
    mapping(address => bool) public authorizedManagers;
    
    event PriceMultiplierUpdated(CropType indexed cropType, uint256 multiplier);
    
    constructor(address initialOwner) Ownable(initialOwner) {
        cropMultipliers[CropType.WHEAT] = 1000;
        cropMultipliers[CropType.GRAPE] = 1000;
        cropMultipliers[CropType.PUMPKIN] = 1000;
        seedMultipliers[SeedType.WHEAT_SEED] = 1000;
        seedMultipliers[SeedType.GRAPE_SEED] = 1000;
        seedMultipliers[SeedType.PUMPKIN_SEED] = 1000;
    }
    
    modifier onlyAuthorized() {
        require(authorizedManagers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function setAuthorizedManager(address manager, bool authorized) external onlyOwner {
        authorizedManagers[manager] = authorized;
    }
    
    function setWheatMultiplier(uint256 multiplier) external onlyAuthorized {
        uint256 multiplierBasis = multiplier * 1000;
        cropMultipliers[CropType.WHEAT] = multiplierBasis;
        seedMultipliers[SeedType.WHEAT_SEED] = multiplierBasis;
        emit PriceMultiplierUpdated(CropType.WHEAT, multiplierBasis);
    }
    
    function getSeedPrice(SeedType seedType) public view returns (uint256) {
        uint256 basePrice;
        if (seedType == SeedType.WHEAT_SEED) basePrice = BASE_WHEAT_SEED;
        else if (seedType == SeedType.GRAPE_SEED) basePrice = BASE_GRAPE_SEED;
        else basePrice = BASE_PUMPKIN_SEED;
        return (basePrice * seedMultipliers[seedType]) / 1000;
    }
    
    function getCropPrice(CropType cropType) public view returns (uint256) {
        uint256 basePrice;
        if (cropType == CropType.WHEAT) basePrice = BASE_WHEAT_CROP;
        else if (cropType == CropType.GRAPE) basePrice = BASE_GRAPE_CROP;
        else basePrice = BASE_PUMPKIN_CROP;
        return (basePrice * cropMultipliers[cropType]) / 1000;
    }
    
    function getAllPrices() external view returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        return (
            getSeedPrice(SeedType.WHEAT_SEED),
            getSeedPrice(SeedType.GRAPE_SEED),
            getSeedPrice(SeedType.PUMPKIN_SEED),
            getCropPrice(CropType.WHEAT),
            getCropPrice(CropType.GRAPE),
            getCropPrice(CropType.PUMPKIN)
        );
    }
}
