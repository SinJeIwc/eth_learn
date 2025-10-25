// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMarketManager.sol";
import "./interfaces/IFarmEffects.sol";

/**
 * @title MarketManager
 * @notice Управляет ценами на рынке в зависимости от событий
 */
contract MarketManager is IMarketManager, Ownable {
    // ID продуктов
    uint16 public constant PRODUCT_TOMATO = 1;
    uint16 public constant PRODUCT_WHEAT = 2;
    uint16 public constant PRODUCT_CORN = 3;
    uint16 public constant PRODUCT_POTATO = 4;

    // Базовые цены (в wei)
    uint256 public constant BASE_PRICE_TOMATO = 0.001 ether;
    uint256 public constant BASE_PRICE_WHEAT = 0.0008 ether;
    uint256 public constant BASE_PRICE_CORN = 0.0012 ether;
    uint256 public constant BASE_PRICE_POTATO = 0.0009 ether;

    // Текущие цены
    mapping(uint16 => uint256) public prices;
    
    // История изменений цен
    mapping(uint256 => PriceChange[]) public roundPriceChanges;

    constructor(address initialOwner) Ownable(initialOwner) {
        // Инициализируем базовые цены
        prices[PRODUCT_TOMATO] = BASE_PRICE_TOMATO;
        prices[PRODUCT_WHEAT] = BASE_PRICE_WHEAT;
        prices[PRODUCT_CORN] = BASE_PRICE_CORN;
        prices[PRODUCT_POTATO] = BASE_PRICE_POTATO;
    }

    /**
     * @notice Пересчитывает цены на основе агрегированных эффектов
     */
    function recalculatePrices(
        uint256 roundId,
        IFarmEffects.EffectResult memory aggregatedEffect
    ) external override returns (PriceChange[] memory) {
        PriceChange[] memory changes = new PriceChange[](4);
        
        // Вычисляем общий модификатор на основе эффектов
        // Если урожайность упала (yieldModifier < 1000), цены растут
        // Если урожайность выросла (yieldModifier > 1000), цены падают
        int16 priceModifier;
        if (aggregatedEffect.yieldModifier < 1000) {
            // Урожайность упала - цены растут
            priceModifier = int16(1000 - aggregatedEffect.yieldModifier);
        } else {
            // Урожайность выросла - цены падают
            priceModifier = -int16(aggregatedEffect.yieldModifier - 1000);
        }

        // Ограничиваем изменение цен ±30%
        if (priceModifier > 300) priceModifier = 300;
        if (priceModifier < -300) priceModifier = -300;

        // Обновляем цены для всех продуктов
        uint16[] memory productIds = new uint16[](4);
        productIds[0] = PRODUCT_TOMATO;
        productIds[1] = PRODUCT_WHEAT;
        productIds[2] = PRODUCT_CORN;
        productIds[3] = PRODUCT_POTATO;

        uint256[] memory newPrices = new uint256[](4);

        for (uint i = 0; i < 4; i++) {
            uint16 productId = productIds[i];
            uint256 currentPrice = prices[productId];
            
            // Применяем модификатор
            int256 priceChange = (int256(currentPrice) * priceModifier) / 1000;
            uint256 newPrice = uint256(int256(currentPrice) + priceChange);
            
            // Ограничиваем цены (не могут упасть ниже 50% или вырасти выше 200% базовой)
            uint256 basePrice = _getBasePrice(productId);
            if (newPrice < basePrice / 2) {
                newPrice = basePrice / 2;
            } else if (newPrice > basePrice * 2) {
                newPrice = basePrice * 2;
            }

            prices[productId] = newPrice;
            newPrices[i] = newPrice;

            changes[i] = PriceChange({
                productId: productId,
                newPrice: newPrice,
                changePercent: priceModifier
            });
        }

        // Сохраняем историю
        for (uint i = 0; i < changes.length; i++) {
            roundPriceChanges[roundId].push(changes[i]);
        }

        emit PricesUpdated(roundId, productIds, newPrices);

        return changes;
    }

    /**
     * @notice Получить текущую цену продукта
     */
    function getPrice(uint16 productId) external view override returns (uint256) {
        return prices[productId];
    }

    /**
     * @notice Получить все текущие цены
     */
    function getAllPrices() external view returns (
        uint256 tomato,
        uint256 wheat,
        uint256 corn,
        uint256 potato
    ) {
        return (
            prices[PRODUCT_TOMATO],
            prices[PRODUCT_WHEAT],
            prices[PRODUCT_CORN],
            prices[PRODUCT_POTATO]
        );
    }

    /**
     * @notice Получить изменения цен за раунд
     */
    function getRoundPriceChanges(uint256 roundId) external view returns (PriceChange[] memory) {
        return roundPriceChanges[roundId];
    }

    /**
     * @notice Сбросить цены к базовым (только owner)
     */
    function resetPrices() external onlyOwner {
        prices[PRODUCT_TOMATO] = BASE_PRICE_TOMATO;
        prices[PRODUCT_WHEAT] = BASE_PRICE_WHEAT;
        prices[PRODUCT_CORN] = BASE_PRICE_CORN;
        prices[PRODUCT_POTATO] = BASE_PRICE_POTATO;
    }

    /**
     * @dev Получить базовую цену продукта
     */
    function _getBasePrice(uint16 productId) internal pure returns (uint256) {
        if (productId == PRODUCT_TOMATO) return BASE_PRICE_TOMATO;
        if (productId == PRODUCT_WHEAT) return BASE_PRICE_WHEAT;
        if (productId == PRODUCT_CORN) return BASE_PRICE_CORN;
        if (productId == PRODUCT_POTATO) return BASE_PRICE_POTATO;
        return 0;
    }
}
