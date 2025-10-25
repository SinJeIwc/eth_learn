// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IFarmEffects.sol";

interface IMarketManager {
    struct PriceChange {
        uint16 productId;
        uint256 newPrice;      // wei per unit
        int16 changePercent;   // -1000 to +1000 (-100% to +100%)
    }

    event PricesUpdated(
        uint256 indexed roundId,
        uint16[] productIds,
        uint256[] newPrices
    );

    function recalculatePrices(
        uint256 roundId,
        IFarmEffects.EffectResult memory aggregatedEffect
    ) external returns (PriceChange[] memory);

    function getPrice(uint16 productId) external view returns (uint256);
}
