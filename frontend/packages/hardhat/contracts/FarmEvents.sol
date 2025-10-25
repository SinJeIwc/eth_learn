// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IFarmEvents.sol";

/**
 * @title FarmEvents
 * @notice Генерирует случайные события для огорода на основе seed
 */
contract FarmEvents is IFarmEvents {
    // Вероятности событий (сумма должна быть 10000 = 100%)
    uint16 public constant PROB_NONE = 3000;      // 30%
    uint16 public constant PROB_LOCUSTS = 1000;   // 10%
    uint16 public constant PROB_WIND = 1500;      // 15%
    uint16 public constant PROB_RAIN = 2000;      // 20%
    uint16 public constant PROB_DROUGHT = 1000;   // 10%
    uint16 public constant PROB_FROST = 800;      // 8%
    uint16 public constant PROB_SUNSTORM = 1200;  // 12%
    uint16 public constant PROB_PESTS = 500;      // 5%

    /**
     * @notice Генерирует событие на основе детерминированного seed
     */
    function generateEvent(
        uint256 gardenId,
        uint256 roundId,
        bytes32 seed
    ) external override returns (EventData memory) {
        // Генерируем случайное число 0-9999
        uint256 random = uint256(seed) % 10000;
        
        EventType eventType = _selectEventType(random);
        uint16 severity = _calculateSeverity(seed, eventType);

        EventData memory eventData = EventData({
            eventType: eventType,
            severity: severity,
            timestamp: uint32(block.timestamp),
            seed: seed
        });

        emit EventGenerated(gardenId, roundId, eventType, severity);
        
        return eventData;
    }

    /**
     * @dev Выбирает тип события на основе вероятностей
     */
    function _selectEventType(uint256 random) internal pure returns (EventType) {
        if (random < PROB_NONE) {
            return EventType.NONE;
        }
        random -= PROB_NONE;
        
        if (random < PROB_LOCUSTS) {
            return EventType.LOCUSTS;
        }
        random -= PROB_LOCUSTS;
        
        if (random < PROB_WIND) {
            return EventType.WIND;
        }
        random -= PROB_WIND;
        
        if (random < PROB_RAIN) {
            return EventType.RAIN;
        }
        random -= PROB_RAIN;
        
        if (random < PROB_DROUGHT) {
            return EventType.DROUGHT;
        }
        random -= PROB_DROUGHT;
        
        if (random < PROB_FROST) {
            return EventType.FROST;
        }
        random -= PROB_FROST;
        
        if (random < PROB_SUNSTORM) {
            return EventType.SUNSTORM;
        }
        
        return EventType.PESTS;
    }

    /**
     * @dev Вычисляет серьезность события (0-1000)
     */
    function _calculateSeverity(
        bytes32 seed,
        EventType eventType
    ) internal pure returns (uint16) {
        if (eventType == EventType.NONE) {
            return 0;
        }

        // Используем другую часть seed для severity
        uint256 severityRand = uint256(keccak256(abi.encodePacked(seed, "severity"))) % 1000;
        
        // Разные события имеют разные диапазоны серьезности
        if (eventType == EventType.LOCUSTS || eventType == EventType.FROST) {
            // Серьезные события: 500-1000
            return uint16(500 + (severityRand % 500));
        } else if (eventType == EventType.PESTS) {
            // Средние события: 300-700
            return uint16(300 + (severityRand % 400));
        } else {
            // Легкие события: 200-600
            return uint16(200 + (severityRand % 400));
        }
    }
}
