// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFarmEvents {
    enum EventType {
        NONE,
        LOCUSTS,      // Саранча - урон растениям
        WIND,         // Ветер - может повредить или помочь
        RAIN,         // Дождь - ускоряет рост
        DROUGHT,      // Засуха - замедляет рост
        FROST,        // Мороз - урон
        SUNSTORM,     // Солнечная буря - бонус к росту
        PESTS         // Вредители - урон
    }

    struct EventData {
        EventType eventType;
        uint16 severity;      // 0-1000 (0.0% - 100.0%)
        uint32 timestamp;
        bytes32 seed;
    }

    event EventGenerated(
        uint256 indexed gardenId,
        uint256 indexed roundId,
        EventType eventType,
        uint16 severity
    );

    function generateEvent(
        uint256 gardenId,
        uint256 roundId,
        bytes32 seed
    ) external returns (EventData memory);
}
