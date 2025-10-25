// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IFarmEvents.sol";

interface IFarmEffects {
    struct EffectResult {
        int16 growthDelta;     // Изменение роста (-1000 to +1000)
        int16 healthDelta;     // Изменение здоровья (-1000 to +1000)
        uint16 yieldModifier;  // Модификатор урожая (1000 = 100%)
        uint32 timestamp;
    }

    event EffectApplied(
        uint256 indexed gardenId,
        uint256 indexed roundId,
        int16 growthDelta,
        int16 healthDelta
    );

    function applyEffect(
        uint256 gardenId,
        uint256 roundId,
        IFarmEvents.EventData memory eventData
    ) external returns (EffectResult memory);
}
