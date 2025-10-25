// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IFarmEvents.sol";
import "./interfaces/IFarmEffects.sol";

/**
 * @title FarmEffects
 * @notice Применяет эффекты событий к огороду
 */
contract FarmEffects is IFarmEffects {
    /**
     * @notice Применяет эффект события к огороду
     */
    function applyEffect(
        uint256 gardenId,
        uint256 roundId,
        IFarmEvents.EventData memory eventData
    ) external override returns (EffectResult memory) {
        EffectResult memory result = EffectResult({
            growthDelta: 0,
            healthDelta: 0,
            yieldModifier: 1000, // 100% by default
            timestamp: uint32(block.timestamp)
        });

        // Применяем эффекты в зависимости от типа события
        if (eventData.eventType == IFarmEvents.EventType.NONE) {
            // Нет события - небольшой естественный рост
            result.growthDelta = 10;
            result.yieldModifier = 1000;
        } 
        else if (eventData.eventType == IFarmEvents.EventType.LOCUSTS) {
            // Саранча - урон здоровью и росту
            result.healthDelta = -int16(eventData.severity / 2); // До -500
            result.growthDelta = -int16(eventData.severity / 4); // До -250
            result.yieldModifier = 700; // -30% урожай
        }
        else if (eventData.eventType == IFarmEvents.EventType.WIND) {
            // Ветер - может быть как полезен, так и вреден
            if (eventData.severity < 500) {
                // Легкий ветер - полезен
                result.growthDelta = int16(eventData.severity / 10);
                result.yieldModifier = 1100; // +10% урожай
            } else {
                // Сильный ветер - вреден
                result.healthDelta = -int16((eventData.severity - 500) / 5);
                result.yieldModifier = 900; // -10% урожай
            }
        }
        else if (eventData.eventType == IFarmEvents.EventType.RAIN) {
            // Дождь - ускоряет рост
            result.growthDelta = int16(eventData.severity / 3); // До +333
            result.yieldModifier = 1200; // +20% урожай
        }
        else if (eventData.eventType == IFarmEvents.EventType.DROUGHT) {
            // Засуха - замедляет рост и вредит здоровью
            result.growthDelta = -int16(eventData.severity / 5);
            result.healthDelta = -int16(eventData.severity / 3);
            result.yieldModifier = 800; // -20% урожай
        }
        else if (eventData.eventType == IFarmEvents.EventType.FROST) {
            // Мороз - серьезный урон
            result.healthDelta = -int16(eventData.severity / 2);
            result.growthDelta = -int16(eventData.severity / 3);
            result.yieldModifier = 600; // -40% урожай
        }
        else if (eventData.eventType == IFarmEvents.EventType.SUNSTORM) {
            // Солнечная буря - бонус к росту
            result.growthDelta = int16(eventData.severity / 2);
            result.yieldModifier = 1300; // +30% урожай
        }
        else if (eventData.eventType == IFarmEvents.EventType.PESTS) {
            // Вредители - урон здоровью
            result.healthDelta = -int16(eventData.severity / 3);
            result.yieldModifier = 850; // -15% урожай
        }

        emit EffectApplied(
            gardenId,
            roundId,
            result.growthDelta,
            result.healthDelta
        );

        return result;
    }
}
