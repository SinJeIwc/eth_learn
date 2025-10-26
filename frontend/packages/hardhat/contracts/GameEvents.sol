// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GameEvents is Ownable {
    enum EventType {
        NONE,
        RAIN,
        DROUGHT,
        WINTER
    }
    
    struct GameEvent {
        EventType eventType;
        uint16 severity;
        uint256 timestamp;
        uint256 blockNumber;
    }
    
    GameEvent[] public eventHistory;
    address public effectsContract;
    uint256 public lastEventTime;
    uint256 public constant EVENT_INTERVAL = 2 minutes;
    
    event EventTriggered(
        uint256 indexed eventId,
        EventType eventType,
        uint16 severity,
        uint256 timestamp
    );
    
    constructor(address initialOwner) Ownable(initialOwner) {
        lastEventTime = (block.timestamp / EVENT_INTERVAL) * EVENT_INTERVAL;
    }
    
    function setEffectsContract(address _effectsContract) external onlyOwner {
        effectsContract = _effectsContract;
    }
    
    function canTriggerEvent() public view returns (bool) {
        uint256 currentRoundedTime = (block.timestamp / EVENT_INTERVAL) * EVENT_INTERVAL;
        return currentRoundedTime > lastEventTime;
    }
    
    function triggerEvent() external returns (uint256 eventId) {
        require(canTriggerEvent(), "Event already triggered in this interval");
        
        uint256 currentRoundedTime = (block.timestamp / EVENT_INTERVAL) * EVENT_INTERVAL;
        lastEventTime = currentRoundedTime;
        
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    currentRoundedTime,
                    block.prevrandao,
                    block.number
                )
            )
        );
        
        EventType eventType = _selectEventType(random % 100);
        uint16 severity = uint16((random >> 8) % 1001);
        
        GameEvent memory newEvent = GameEvent({
            eventType: eventType,
            severity: severity,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        
        eventHistory.push(newEvent);
        eventId = eventHistory.length - 1;
        
        emit EventTriggered(eventId, eventType, severity, block.timestamp);
        
        if (effectsContract != address(0)) {
            (bool success, ) = effectsContract.call(
                abi.encodeWithSignature(
                    "applyEventEffects(uint8,uint16)",
                    uint8(eventType),
                    severity
                )
            );
            require(success, "Effects contract call failed");
        }
        
        return eventId;
    }
    
    function _selectEventType(uint256 roll) internal pure returns (EventType) {
        if (roll < 40) return EventType.NONE;
        if (roll < 65) return EventType.RAIN;
        if (roll < 85) return EventType.DROUGHT;
        return EventType.WINTER;
    }
    
    function getEvent(uint256 eventId) external view returns (GameEvent memory) {
        require(eventId < eventHistory.length, "Event does not exist");
        return eventHistory[eventId];
    }
    
    function getEventsCount() external view returns (uint256) {
        return eventHistory.length;
    }
    
    function getCurrentMarketInterval() external view returns (uint256) {
        return (block.timestamp / 5 minutes) * 5 minutes;
    }
    
    function getMarketIntervalNumber() external view returns (uint256) {
        return block.timestamp / 5 minutes;
    }
    
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
