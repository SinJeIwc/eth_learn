// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameEvents
 * @notice Generates random farm events (locusts, wind, rain, etc.)
 * @dev First contract in the chain reaction
 */
contract GameEvents is Ownable {
    enum EventType {
        NONE,       // 30% - Nothing happens
        LOCUSTS,    // 15% - Damage crops
        WIND,       // 10% - Minor damage
        RAIN,       // 20% - Good for growth
        DROUGHT,    // 10% - Reduces health
        FROST,      // 5%  - Heavy damage
        SUNSTORM,   // 5%  - Boosts growth
        PESTS       // 5%  - Moderate damage
    }
    
    struct GameEvent {
        EventType eventType;
        uint16 severity;      // 0-1000
        uint256 timestamp;
        uint256 blockNumber;
    }
    
    // Store event history
    GameEvent[] public eventHistory;
    
    // Next contract in chain (FarmEffects)
    address public effectsContract;
    
    event EventTriggered(
        uint256 indexed eventId,
        EventType eventType,
        uint16 severity,
        uint256 timestamp
    );
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    /**
     * @notice Set the effects contract address
     */
    function setEffectsContract(address _effectsContract) external onlyOwner {
        effectsContract = _effectsContract;
    }
    
    /**
     * @notice Generate a random event (called by keeper or player action)
     */
    function triggerEvent() external returns (uint256 eventId) {
        // Generate pseudo-random number
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    eventHistory.length
                )
            )
        );
        
        // Select event type based on probability
        EventType eventType = _selectEventType(random % 100);
        
        // Calculate severity (0-1000)
        uint16 severity = uint16((random >> 8) % 1001);
        
        // Store event
        GameEvent memory newEvent = GameEvent({
            eventType: eventType,
            severity: severity,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        
        eventHistory.push(newEvent);
        eventId = eventHistory.length - 1;
        
        emit EventTriggered(eventId, eventType, severity, block.timestamp);
        
        return eventId;
    }
    
    /**
     * @notice Select event type based on weighted probability
     */
    function _selectEventType(uint256 rand) internal pure returns (EventType) {
        if (rand < 30) return EventType.NONE;        // 30%
        if (rand < 50) return EventType.RAIN;        // 20%
        if (rand < 65) return EventType.LOCUSTS;     // 15%
        if (rand < 75) return EventType.WIND;        // 10%
        if (rand < 85) return EventType.DROUGHT;     // 10%
        if (rand < 90) return EventType.SUNSTORM;    // 5%
        if (rand < 95) return EventType.FROST;       // 5%
        return EventType.PESTS;                      // 5%
    }
    
    /**
     * @notice Get event by ID
     */
    function getEvent(uint256 eventId) external view returns (GameEvent memory) {
        require(eventId < eventHistory.length, "Event does not exist");
        return eventHistory[eventId];
    }
    
    /**
     * @notice Get total events count
     */
    function getEventsCount() external view returns (uint256) {
        return eventHistory.length;
    }
    
    /**
     * @notice Get recent events
     */
    function getRecentEvents(uint256 count) external view returns (GameEvent[] memory) {
        uint256 total = eventHistory.length;
        if (count > total) count = total;
        
        GameEvent[] memory recent = new GameEvent[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = eventHistory[total - count + i];
        }
        
        return recent;
    }
}
