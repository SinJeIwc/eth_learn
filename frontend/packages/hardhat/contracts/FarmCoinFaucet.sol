// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FarmCoin.sol";

/**
 * @title FarmCoinFaucet
 * @notice Faucet для автоматической выдачи стартовых токенов новым игрокам
 */
contract FarmCoinFaucet {
    FarmCoin public farmCoin;
    
    // Количество стартовых токенов (50 FarmCoin)
    uint256 public constant STARTER_AMOUNT = 50 * 10**18;
    
    // Трекинг кто уже получил токены
    mapping(address => bool) public hasReceivedTokens;
    
    event TokensClaimed(address indexed player, uint256 amount);
    
    constructor(address _farmCoin) {
        farmCoin = FarmCoin(_farmCoin);
    }
    
    /**
     * @notice Получить стартовые токены (только один раз)
     */
    function claimStarterTokens() external {
        require(!hasReceivedTokens[msg.sender], "Already claimed");
        require(farmCoin.balanceOf(msg.sender) == 0, "Already have tokens");
        
        hasReceivedTokens[msg.sender] = true;
        farmCoin.mint(msg.sender, STARTER_AMOUNT);
        
        emit TokensClaimed(msg.sender, STARTER_AMOUNT);
    }
    
    /**
     * @notice Проверить, может ли адрес получить токены
     */
    function canClaim(address player) external view returns (bool) {
        return !hasReceivedTokens[player] && farmCoin.balanceOf(player) == 0;
    }
}
