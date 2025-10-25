// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FarmCoin
 * @notice ERC20 token for in-game currency
 */
contract FarmCoin is ERC20, Ownable {
    // Authorized contracts that can mint/burn tokens
    mapping(address => bool) public authorizedMinters;
    
    event MinterAuthorized(address indexed minter, bool authorized);
    
    constructor(address initialOwner) 
        ERC20("Farm Coin", "FARM") 
        Ownable(initialOwner)
    {
        // Mint initial supply to owner
        _mint(initialOwner, 1000000 * 10**decimals());
    }
    
    /**
     * @notice Authorize a contract to mint/burn tokens
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }
    
    /**
     * @notice Mint tokens (only authorized minters)
     */
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _mint(to, amount);
    }
    
    /**
     * @notice Burn tokens from sender
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @notice Burn tokens from account (only authorized minters)
     */
    function burnFrom(address account, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized to burn");
        _burn(account, amount);
    }
}
