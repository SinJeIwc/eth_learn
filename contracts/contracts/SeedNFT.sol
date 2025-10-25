// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28; // Use Solidity version ^0.8.28 as requested

// Import OpenZeppelin ERC721 implementation and helpers
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // Core ERC721
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol"; // Owner-only access control

/// @title SeedNFT - ERC721 contract representing seed items for the Farmer game
/// @notice Supports three seed types: wheat, corn, rice. Mint/burn controlled by the game contract.
contract SeedNFT is ERC721, Ownable {

    // Enum of supported seed types
    enum SeedType { Wheat, Corn, Rice } // 0: Wheat, 1: Corn, 2: Rice

    // Simple incrementing token ID counter starting at 0 (first mint will be 1)
    uint256 private _nextTokenId; // Tracks the next token ID to mint

    // Per-token metadata URIs stored on-chain for simplicity
    mapping(uint256 => string) private _tokenURIs; // tokenId => URI

    // Mapping from token ID to seed type to enable game logic at harvest
    mapping(uint256 => SeedType) public seedTypeOf; // Public for easy reads from other contracts/UI

    // Address of the authorized game contract that can mint/burn/transfer as part of gameplay
    address public gameContract; // Settable by owner; used for access control

    // Emitted when the game contract is updated
    event GameContractUpdated(address indexed previousGame, address indexed newGame); // Transparency for setup changes

    /// @notice Initialize the ERC721 collection
    constructor() ERC721("Farm Seeds", "SEED") Ownable(msg.sender) {
        // No initial mint; the game contract will mint as needed
    }

    /// @notice Set the game contract address with mint/burn permissions
    /// @param newGame Address of the FarmGame contract
    function setGameContract(address newGame) external onlyOwner {
        // Save previous address for event
        address previous = gameContract; // Read old value
        gameContract = newGame; // Set new game address
        emit GameContractUpdated(previous, newGame); // Emit change
    }

    /// @notice Mint a new seed NFT to a player; callable only by the game contract
    /// @param to Recipient address
    /// @param seedType Seed type enum value
    /// @param tokenURI_ Metadata URI for the NFT
    /// @return tokenId Newly minted token ID
    function mintSeed(address to, SeedType seedType, string memory tokenURI_) external returns (uint256 tokenId) {
        // Restrict minting to the game contract for controlled supply
        require(msg.sender == gameContract, "Only game"); // Access control
        // Increment counter and use as new token ID (start from 1)
        _nextTokenId += 1; // Increase token ID counter
        tokenId = _nextTokenId; // Assign current token ID
        _safeMint(to, tokenId); // Mint the token safely to recipient
        _tokenURIs[tokenId] = tokenURI_; // Save the per-token metadata URI
        seedTypeOf[tokenId] = seedType; // Record the seed type for this token
    }

    /// @notice Burn a seed NFT; callable only by the game contract regardless of current owner
    /// @param tokenId ID of the token to burn
    function burn(uint256 tokenId) external {
        // Restrict burning to the game contract
        require(msg.sender == gameContract, "Only game"); // Access control
        _burn(tokenId); // Burn the token (will clear approvals)
        delete seedTypeOf[tokenId]; // Clean up the seed type mapping
        delete _tokenURIs[tokenId]; // Clean up stored URI
    }

    /// @dev Return the token URI from local storage
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token"); // Validate existence
        return _tokenURIs[tokenId]; // Return stored URI
    }
}
