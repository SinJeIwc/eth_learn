// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TimeBasedOracle.sol";

/**
 * @title PersonalizedShop
 * @notice Магазин с персонализированным ассортиментом для каждого игрока
 * @dev Каждый игрок видит свой уникальный набор товаров, обновляемый каждые 24 часа
 */
contract PersonalizedShop {
    TimeBasedOracle public oracle;
    
    enum CropType { WHEAT, GRAPE, PUMPKIN, CORN }
    
    struct ShopInventory {
        uint256 dailyEpoch;      // День когда сгенерирован
        uint8 wheatQuantity;     // 0-10
        uint8 grapeQuantity;     // 0-10
        uint8 pumpkinQuantity;   // 0-10
        uint8 cornQuantity;      // 0-10
        uint256 wheatPrice;      // Цена с учетом событий
        uint256 grapePrice;
        uint256 pumpkinPrice;
        uint256 cornPrice;
    }
    
    // Базовые цены (в wei для тестов)
    uint256 public constant BASE_WHEAT_PRICE = 0.001 ether;
    uint256 public constant BASE_GRAPE_PRICE = 0.003 ether;
    uint256 public constant BASE_PUMPKIN_PRICE = 0.005 ether;
    uint256 public constant BASE_CORN_PRICE = 0.002 ether;
    
    event ShopGenerated(
        address indexed player,
        uint256 dailyEpoch,
        uint8 wheat,
        uint8 grape,
        uint8 pumpkin,
        uint8 corn
    );
    
    constructor(address _oracle) {
        oracle = TimeBasedOracle(_oracle);
    }
    
    /**
     * @notice Получить магазин игрока (read-only)
     * @param player Адрес игрока
     * @param priceMultipliers Множители цен от событий [wheat, grape, pumpkin, corn]
     * @return Инвентарь магазина для игрока
     */
    function getPlayerShop(
        address player,
        uint256[4] memory priceMultipliers
    ) 
        public 
        view 
        returns (ShopInventory memory) 
    {
        bytes32 dailyHash = oracle.getDailyHash();
        uint256 dailyEpoch = oracle.getDailyEpoch();
        bytes32 playerHash = oracle.getPlayerDailyHash(player, dailyHash);
        
        // Генерируем количество для каждой культуры (0-10)
        uint8 wheatQty = uint8(oracle.getRange(playerHash, 0, 0, 11));
        uint8 grapeQty = uint8(oracle.getRange(playerHash, 1, 0, 11));
        uint8 pumpkinQty = uint8(oracle.getRange(playerHash, 2, 0, 11));
        uint8 cornQty = uint8(oracle.getRange(playerHash, 3, 0, 11));
        
        // Применяем множители цен от событий (1000 = 1.0x, 1150 = 1.15x)
        uint256 wheatPrice = (BASE_WHEAT_PRICE * priceMultipliers[0]) / 1000;
        uint256 grapePrice = (BASE_GRAPE_PRICE * priceMultipliers[1]) / 1000;
        uint256 pumpkinPrice = (BASE_PUMPKIN_PRICE * priceMultipliers[2]) / 1000;
        uint256 cornPrice = (BASE_CORN_PRICE * priceMultipliers[3]) / 1000;
        
        return ShopInventory({
            dailyEpoch: dailyEpoch,
            wheatQuantity: wheatQty,
            grapeQuantity: grapeQty,
            pumpkinQuantity: pumpkinQty,
            cornQuantity: cornQty,
            wheatPrice: wheatPrice,
            grapePrice: grapePrice,
            pumpkinPrice: pumpkinPrice,
            cornPrice: cornPrice
        });
    }
    
    /**
     * @notice Проверить доступность товара
     */
    function isAvailable(
        address player,
        CropType cropType,
        uint256 quantity,
        uint256[4] memory priceMultipliers
    ) 
        public 
        view 
        returns (bool) 
    {
        ShopInventory memory shop = getPlayerShop(player, priceMultipliers);
        
        if (cropType == CropType.WHEAT) {
            return shop.wheatQuantity >= quantity;
        } else if (cropType == CropType.GRAPE) {
            return shop.grapeQuantity >= quantity;
        } else if (cropType == CropType.PUMPKIN) {
            return shop.pumpkinQuantity >= quantity;
        } else {
            return shop.cornQuantity >= quantity;
        }
    }
    
    /**
     * @notice Получить цену с учетом событий
     */
    function getPrice(
        CropType cropType,
        uint256[4] memory priceMultipliers
    ) 
        public 
        view 
        returns (uint256) 
    {
        uint256 basePrice;
        uint256 multiplier;
        
        if (cropType == CropType.WHEAT) {
            basePrice = BASE_WHEAT_PRICE;
            multiplier = priceMultipliers[0];
        } else if (cropType == CropType.GRAPE) {
            basePrice = BASE_GRAPE_PRICE;
            multiplier = priceMultipliers[1];
        } else if (cropType == CropType.PUMPKIN) {
            basePrice = BASE_PUMPKIN_PRICE;
            multiplier = priceMultipliers[2];
        } else {
            basePrice = BASE_CORN_PRICE;
            multiplier = priceMultipliers[3];
        }
        
        return (basePrice * multiplier) / 1000;
    }
}
