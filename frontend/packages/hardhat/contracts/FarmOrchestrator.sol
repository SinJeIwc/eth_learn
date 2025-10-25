// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IFarmEvents.sol";
import "./interfaces/IFarmEffects.sol";
import "./interfaces/IMarketManager.sol";

/**
 * @title FarmOrchestrator
 * @notice Координирует выполнение раундов: Events -> Effects -> Market
 * @dev Использует commit-reveal схему для RNG и гарантирует идемпотентность
 */
contract FarmOrchestrator is AccessControl, ReentrancyGuard {
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    
    // Структура данных огорода
    struct Garden {
        address owner;
        uint16 plantCount;
        uint16 totalGrowth;
        uint16 totalHealth;
        uint256 lastRoundExecuted;
        bool exists;
    }

    // Метаданные раунда
    struct RoundMeta {
        uint256 id;
        uint256 timestamp;
        bytes32 seedHash;      // Committed hash
        bytes32 revealedSeed;  // Revealed seed
        bool committed;
        bool executed;
        bytes32 resultHash;    // Hash результатов для верификации
    }

    // Результат выполнения раунда
    struct RoundResult {
        IFarmEvents.EventData eventData;
        IFarmEffects.EffectResult effectResult;
        uint256 pricesUpdated;
        uint256 executedAt;
    }

    // Storage
    mapping(uint256 => Garden) public gardens;
    mapping(uint256 => mapping(uint256 => RoundMeta)) public roundMetas;  // gardenId => roundId => RoundMeta
    mapping(uint256 => mapping(uint256 => RoundResult)) public roundResults; // gardenId => roundId => RoundResult
    
    uint256 public gardenCounter;
    uint256 public constant ROUND_INTERVAL = 20; // seconds

    // Contract references
    IFarmEvents public farmEvents;
    IFarmEffects public farmEffects;
    IMarketManager public marketManager;

    // Events
    event GardenCreated(uint256 indexed gardenId, address indexed owner);
    event RoundCommitted(uint256 indexed gardenId, uint256 indexed roundId, bytes32 seedHash, address committer);
    event RoundExecuted(uint256 indexed gardenId, uint256 indexed roundId, bytes32 seed, bytes32 resultHash);
    
    constructor(
        address _farmEvents,
        address _farmEffects,
        address _marketManager
    ) {
        require(_farmEvents != address(0), "Invalid FarmEvents address");
        require(_farmEffects != address(0), "Invalid FarmEffects address");
        require(_marketManager != address(0), "Invalid MarketManager address");

        farmEvents = IFarmEvents(_farmEvents);
        farmEffects = IFarmEffects(_farmEffects);
        marketManager = IMarketManager(_marketManager);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KEEPER_ROLE, msg.sender);
    }

    /**
     * @notice Создание нового огорода
     */
    function createGarden() external returns (uint256) {
        gardenCounter++;
        uint256 gardenId = gardenCounter;
        
        gardens[gardenId] = Garden({
            owner: msg.sender,
            plantCount: 5,  // Начальное количество растений
            totalGrowth: 500,  // 50% начальный рост
            totalHealth: 1000, // 100% здоровье
            lastRoundExecuted: 0,
            exists: true
        });

        emit GardenCreated(gardenId, msg.sender);
        return gardenId;
    }

    /**
     * @notice Commit фаза: keeper коммитит hash seed'а
     */
    function commitRound(
        uint256 gardenId,
        uint256 roundId,
        bytes32 seedHash
    ) external onlyRole(KEEPER_ROLE) {
        require(gardens[gardenId].exists, "Garden does not exist");
        require(!roundMetas[gardenId][roundId].committed, "Round already committed");
        require(seedHash != bytes32(0), "Invalid seed hash");

        roundMetas[gardenId][roundId] = RoundMeta({
            id: roundId,
            timestamp: block.timestamp,
            seedHash: seedHash,
            revealedSeed: bytes32(0),
            committed: true,
            executed: false,
            resultHash: bytes32(0)
        });

        emit RoundCommitted(gardenId, roundId, seedHash, msg.sender);
    }

    /**
     * @notice Execute фаза: keeper раскрывает seed и выполняет раунд
     */
    function executeRound(
        uint256 gardenId,
        uint256 roundId,
        bytes calldata revealSeed
    ) external onlyRole(KEEPER_ROLE) nonReentrant {
        require(gardens[gardenId].exists, "Garden does not exist");
        RoundMeta storage meta = roundMetas[gardenId][roundId];
        
        require(meta.committed, "Round not committed");
        require(!meta.executed, "Round already executed");
        require(keccak256(revealSeed) == meta.seedHash, "Invalid reveal");

        // Генерируем финальный seed с дополнительной энтропией
        bytes32 finalSeed = keccak256(
            abi.encodePacked(
                revealSeed,
                blockhash(block.number - 1),
                gardenId,
                roundId,
                block.timestamp
            )
        );

        meta.revealedSeed = finalSeed;

        // 1. Генерируем событие
        IFarmEvents.EventData memory eventData = farmEvents.generateEvent(
            gardenId,
            roundId,
            finalSeed
        );

        // 2. Применяем эффект
        IFarmEffects.EffectResult memory effectResult = farmEffects.applyEffect(
            gardenId,
            roundId,
            eventData
        );

        // Обновляем состояние огорода
        Garden storage garden = gardens[gardenId];
        garden.totalGrowth = uint16(_clampToUint16(int256(uint256(garden.totalGrowth)) + int256(effectResult.growthDelta)));
        garden.totalHealth = uint16(_clampToUint16(int256(uint256(garden.totalHealth)) + int256(effectResult.healthDelta)));
        garden.lastRoundExecuted = roundId;

        // 3. Обновляем рынок
        IMarketManager.PriceChange[] memory priceChanges = marketManager.recalculatePrices(
            roundId,
            effectResult
        );

        // Сохраняем результаты
        roundResults[gardenId][roundId] = RoundResult({
            eventData: eventData,
            effectResult: effectResult,
            pricesUpdated: priceChanges.length,
            executedAt: block.timestamp
        });

        // Вычисляем hash результата для верификации
        bytes32 resultHash = keccak256(
            abi.encodePacked(
                finalSeed,
                uint8(eventData.eventType),
                eventData.severity,
                effectResult.growthDelta,
                effectResult.healthDelta
            )
        );

        meta.executed = true;
        meta.resultHash = resultHash;

        emit RoundExecuted(gardenId, roundId, finalSeed, resultHash);
    }

    /**
     * @notice Получить текущее состояние огорода
     */
    function getGarden(uint256 gardenId) external view returns (Garden memory) {
        require(gardens[gardenId].exists, "Garden does not exist");
        return gardens[gardenId];
    }

    /**
     * @notice Получить результат раунда
     */
    function getRoundResult(
        uint256 gardenId,
        uint256 roundId
    ) external view returns (RoundResult memory) {
        return roundResults[gardenId][roundId];
    }

    /**
     * @notice Проверить, был ли выполнен раунд
     */
    function isRoundExecuted(
        uint256 gardenId,
        uint256 roundId
    ) external view returns (bool) {
        return roundMetas[gardenId][roundId].executed;
    }

    /**
     * @dev Применить дельту к значению с границами и вернуть uint16
     */
    function _clampToUint16(int256 value) internal pure returns (uint256) {
        if (value < 0) return 0;
        if (value > 1000) return 1000;
        return uint256(value);
    }

    /**
     * @notice Обновить адреса контрактов (только admin)
     */
    function updateContracts(
        address _farmEvents,
        address _farmEffects,
        address _marketManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_farmEvents != address(0)) farmEvents = IFarmEvents(_farmEvents);
        if (_farmEffects != address(0)) farmEffects = IFarmEffects(_farmEffects);
        if (_marketManager != address(0)) marketManager = IMarketManager(_marketManager);
    }
}
