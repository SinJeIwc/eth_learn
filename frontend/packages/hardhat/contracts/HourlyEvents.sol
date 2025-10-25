// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TimeBasedOracle.sol";

/**
 * @title HourlyEvents
 * @notice Генерирует случайные события каждый час
 * @dev События: NONE (40%), RAIN (15%), LOCUSTS (10%), PRICE_SURGE (15%), другие
 */
contract HourlyEvents {
    TimeBasedOracle public oracle;
    
    enum EventType {
        NONE,           // 40% - Ничего не происходит
        RAIN,           // 15% - Ускорение роста (2x)
        LOCUSTS,        // 10% - Уничтожение 10-50% посевов
        PRICE_SURGE,    // 15% - Цена на 1 культуру +15%
        DROUGHT,        // 10% - Замедление роста
        BLESSING        // 10% - Цена на все -10%
    }
    
    struct GameEvent {
        EventType eventType;
        uint256 hourlyEpoch;
        uint8 targetCrop;       // Для PRICE_SURGE (0-3)
        uint8 severity;         // 10-50 для LOCUSTS
        uint256 timestamp;
    }
    
    // История событий
    mapping(uint256 => GameEvent) public events;
    
    event EventGenerated(
        uint256 indexed hourlyEpoch,
        EventType eventType,
        uint8 targetCrop,
        uint8 severity
    );
    
    constructor(address _oracle) {
        oracle = TimeBasedOracle(_oracle);
    }
    
    /**
     * @notice Получить текущее событие (read-only)
     * @return Событие для текущего часа
     */
    function getCurrentEvent() public view returns (GameEvent memory) {
        uint256 hourlyEpoch = oracle.getHourlyEpoch();
        
        // Проверяем кеш
        if (events[hourlyEpoch].hourlyEpoch == hourlyEpoch) {
            return events[hourlyEpoch];
        }
        
        // Генерируем новое событие
        bytes32 hourlyHash = oracle.getHourlyHash();
        uint256 roll = oracle.getPercentage(hourlyHash, 0);
        
        EventType eventType;
        if (roll < 40) {
            eventType = EventType.NONE;
        } else if (roll < 55) {
            eventType = EventType.RAIN;
        } else if (roll < 65) {
            eventType = EventType.LOCUSTS;
        } else if (roll < 80) {
            eventType = EventType.PRICE_SURGE;
        } else if (roll < 90) {
            eventType = EventType.DROUGHT;
        } else {
            eventType = EventType.BLESSING;
        }
        
        // Дополнительные параметры
        uint8 targetCrop = uint8(oracle.getRange(hourlyHash, 1, 0, 4));
        uint8 severity = uint8(oracle.getRange(hourlyHash, 2, 10, 51));
        
        return GameEvent({
            eventType: eventType,
            hourlyEpoch: hourlyEpoch,
            targetCrop: targetCrop,
            severity: severity,
            timestamp: block.timestamp
        });
    }
    
    /**
     * @notice Сохранить событие в storage (вызывается при первом обращении игрока)
     */
    function cacheCurrentEvent() external returns (GameEvent memory) {
        GameEvent memory currentEvent = getCurrentEvent();
        uint256 hourlyEpoch = oracle.getHourlyEpoch();
        
        // Сохраняем только если еще не закешировано
        if (events[hourlyEpoch].hourlyEpoch != hourlyEpoch) {
            events[hourlyEpoch] = currentEvent;
            
            emit EventGenerated(
                hourlyEpoch,
                currentEvent.eventType,
                currentEvent.targetCrop,
                currentEvent.severity
            );
        }
        
        return currentEvent;
    }
    
    /**
     * @notice Проверить влияет ли событие на игрока (50/50 для LOCUSTS)
     */
    function doesEventAffectPlayer(address player) public view returns (bool) {
        GameEvent memory currentEvent = getCurrentEvent();
        
        if (currentEvent.eventType != EventType.LOCUSTS) {
            return true; // Все остальные события влияют на всех
        }
        
        // Для саранчи - 50/50 шанс
        bytes32 playerHash = keccak256(
            abi.encodePacked(
                player,
                oracle.getHourlyHash()
            )
        );
        
        return oracle.getPercentage(playerHash, 0) < 50;
    }
    
    /**
     * @notice Получить множители цен на основе события
     * @return [wheat, grape, pumpkin, corn] где 1000 = 1.0x, 1150 = 1.15x
     */
    function getPriceMultipliers() public view returns (uint256[4] memory) {
        GameEvent memory currentEvent = getCurrentEvent();
        uint256[4] memory multipliers = [uint256(1000), 1000, 1000, 1000];
        
        if (currentEvent.eventType == EventType.PRICE_SURGE) {
            // +15% на одну культуру
            multipliers[currentEvent.targetCrop] = 1150;
        } else if (currentEvent.eventType == EventType.BLESSING) {
            // -10% на все
            multipliers[0] = 900;
            multipliers[1] = 900;
            multipliers[2] = 900;
            multipliers[3] = 900;
        }
        
        return multipliers;
    }
    
    /**
     * @notice Получить множитель скорости роста
     * @return 2000 = 2x (в 2 раза быстрее), 500 = 0.5x (в 2 раза медленнее)
     */
    function getGrowthMultiplier() public view returns (uint256) {
        GameEvent memory currentEvent = getCurrentEvent();
        
        if (currentEvent.eventType == EventType.RAIN) {
            return 2000; // 2x быстрее
        } else if (currentEvent.eventType == EventType.DROUGHT) {
            return 500;  // 2x медленнее
        }
        
        return 1000; // Нормальная скорость
    }
}
