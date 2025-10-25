// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TimeBasedOracle
 * @notice Генерирует детерминированные хеши на основе времени
 * @dev Два типа хешей: дневной (24ч) и часовой (1ч)
 */
contract TimeBasedOracle {
    // Epoch для дневного хеша (00:00 UTC каждого дня)
    function getDailyEpoch() public view returns (uint256) {
        return block.timestamp / 1 days;
    }
    
    // Epoch для часового хеша
    function getHourlyEpoch() public view returns (uint256) {
        return block.timestamp / 1 hours;
    }
    
    /**
     * @notice Дневной хеш (обновляется каждые 24 часа)
     * @dev Включает год, месяц, день
     */
    function getDailyHash() public view returns (bytes32) {
        uint256 dailyEpoch = getDailyEpoch();
        return keccak256(
            abi.encodePacked(
                "DAILY",
                dailyEpoch,
                block.chainid
            )
        );
    }
    
    /**
     * @notice Часовой хеш (обновляется каждый час)
     * @dev Включает год, месяц, день, час
     */
    function getHourlyHash() public view returns (bytes32) {
        uint256 hourlyEpoch = getHourlyEpoch();
        return keccak256(
            abi.encodePacked(
                "HOURLY",
                hourlyEpoch,
                block.chainid
            )
        );
    }
    
    /**
     * @notice Персонализированный хеш для игрока
     * @param player Адрес игрока
     * @param dailyHash Дневной хеш
     * @return Уникальный хеш для игрока на этот день
     */
    function getPlayerDailyHash(address player, bytes32 dailyHash) 
        public 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(player, dailyHash));
    }
    
    /**
     * @notice Получить процент от 0 до 99 из хеша
     */
    function getPercentage(bytes32 hash, uint256 offset) 
        public 
        pure 
        returns (uint256) 
    {
        return uint256(keccak256(abi.encodePacked(hash, offset))) % 100;
    }
    
    /**
     * @notice Получить число в диапазоне
     */
    function getRange(bytes32 hash, uint256 offset, uint256 min, uint256 max) 
        public 
        pure 
        returns (uint256) 
    {
        require(max > min, "Invalid range");
        uint256 range = max - min;
        return min + (uint256(keccak256(abi.encodePacked(hash, offset))) % range);
    }
}
