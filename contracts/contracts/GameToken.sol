// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28; // Use Solidity version ^0.8.28 as requested

// Import OpenZeppelin ERC20 and Ownable implementations
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol"; // Standard ERC20 implementation
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol"; // Access control for owner-only functions

/// @title FarmToken (FRM) - In-game currency for the Web3 Farmer game
/// @notice Minted to players upon registration via the game contract
contract GameToken is ERC20, Ownable {
    // Address of the authorized game contract that can mint tokens
    address public gameContract; // Settable by the owner; used to control mint rights

    // Emitted when the game contract address is updated
    event GameContractUpdated(address indexed previousGame, address indexed newGame); // To track configuration changes on-chain

    /// @notice Initialize the ERC20 with name and symbol
    constructor() ERC20("FarmToken", "FRM") Ownable(msg.sender) {
        // No initial supply; minting is controlled and performed by the game contract
    }

    /// @notice Set the game contract that is allowed to mint tokens
    /// @param newGame Address of the FarmGame contract
    function setGameContract(address newGame) external onlyOwner {
        // Save previous address for event transparency
        address previous = gameContract; // Read old value
        gameContract = newGame; // Update to the new authorized minter
        emit GameContractUpdated(previous, newGame); // Emit configuration change
    }

    /// @notice Mint tokens to a player; callable only by the authorized game contract
    /// @param to Receiver address (typically the registering player)
    /// @param amount Amount in wei (18 decimals) to mint
    function mintTo(address to, uint256 amount) external {
        // Restrict minting to the configured game contract
        require(msg.sender == gameContract, "Only game"); // Prevent arbitrary minting
        _mint(to, amount); // Mint the requested amount to the receiver
    }
}
