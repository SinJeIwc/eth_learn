// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28; // Use Solidity version ^0.8.28 as requested

// Import utilities and security modules from OpenZeppelin
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol"; // Owner access control for administrative functions
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // Protect state-changing functions from reentrancy
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Interface to interact with the ERC20 GameToken
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol"; // Interface for checking ownership/approval
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol"; // Receiver interface for safe transfers

// Import local contracts
import {GameToken} from "./GameToken.sol"; // The FRM token contract
import {SeedNFT} from "./SeedNFT.sol"; // The seed NFT contract

/// @title FarmGame - Core game logic for the Web3 Farmer game
/// @notice Orchestrates registration, seed purchases, planting, harvesting, and dynamic events
contract FarmGame is Ownable, ReentrancyGuard, IERC721Receiver {
    // --- Types and constants ---

    // Match the seed type enum in the SeedNFT contract to keep type safety
    enum SeedType { Wheat, Corn, Rice } // 0: Wheat, 1: Corn, 2: Rice

    // Pseudo-random event types that impact shop pricing
    enum WeatherEvent { Normal, Rain, Locust } // Normal pricing, Rain discount, Locust surcharge

    // Field dimensions constants (8 x 6)
    uint256 public constant FIELD_WIDTH = 8; // Number of columns
    uint256 public constant FIELD_HEIGHT = 6; // Number of rows
    uint256 public constant FIELD_SIZE = FIELD_WIDTH * FIELD_HEIGHT; // Total cells per player

    // Gameplay timing constants
    uint256 public constant PLANT_MATURITY_SECONDS = 60; // Harvest available after 1 minute
    uint256 public constant EVENT_INTERVAL_SECONDS = 120; // Weather event updates every 2 minutes

    // Price constants in FRM (18 decimals). Base prices per seed type.
    // These can be adjusted by the owner if needed via setters (not strictly required by spec).
    uint256 public basePriceWheat = 10 ether; // Base 10 FRM for wheat
    uint256 public basePriceCorn = 12 ether; // Base 12 FRM for corn
    uint256 public basePriceRice = 15 ether; // Base 15 FRM for rice

    // Multipliers expressed in percentage points for integer math (100 == 1.00x)
    uint256 public constant MULTIPLIER_NORMAL = 100; // 1.00x
    uint256 public constant MULTIPLIER_RAIN = 80; // 0.80x (20% discount)
    uint256 public constant MULTIPLIER_LOCUST = 150; // 1.50x (50% surcharge)

    // References to token and NFT contracts used by the game
    GameToken public immutable frmToken; // ERC20 in-game currency
    SeedNFT public immutable seedNft; // ERC721 seed items

    // Track whether a player has registered already to prevent double rewards
    mapping(address => bool) public isRegistered; // True if player has received initial assets

    // Represent a planted seed in a specific grid cell
    struct Planted {
        uint256 tokenId; // The NFT token ID being planted (held in escrow by this contract)
        SeedType seedType; // The seed type of the planted NFT
        uint64 plantedAt; // Block timestamp when the seed was planted
        bool occupied; // Whether the cell is currently used
    }

    // Per-player field state: mapping of cell index to Planted struct
    mapping(address => mapping(uint256 => Planted)) private field; // Public accessors provided below

    // Per-player weather event state
    struct PlayerEventState {
        WeatherEvent currentEvent; // The last computed event for the player
        uint64 lastUpdatedAt; // Timestamp when event was last updated
    }

    mapping(address => PlayerEventState) public playerEventState; // Weather events affecting pricing per player

    // Default token URIs for starter seeds minted on registration (can be updated by owner)
    string public starterURIWheat = "ipfs://seed/wheat-starter"; // Default starter URI for wheat
    string public starterURICorn = "ipfs://seed/corn-starter"; // Default starter URI for corn
    string public starterURIRice = "ipfs://seed/rice-starter"; // Default starter URI for rice

    // --- Events ---

    event PlayerRegistered(address indexed player); // Emitted after successful registration
    event SeedPurchased(address indexed player, SeedType indexed seedType, uint256 pricePaid, uint256 tokenId); // Purchase event
    event SeedPlanted(address indexed player, uint256 indexed x, uint256 indexed y, uint256 cellIndex, uint256 tokenId, SeedType seedType); // Planting event
    event SeedHarvested(address indexed player, uint256 indexed x, uint256 indexed y, uint256 cellIndex, uint256 oldTokenId, uint256 newTokenId1, uint256 newTokenId2, SeedType seedType); // Harvest event
    event WeatherEventUpdated(address indexed player, WeatherEvent newEvent, uint256 effectiveAt); // Weather update event

    // --- Constructor ---

    /// @notice Initialize with addresses of the FRM token and Seed NFT contracts
    /// @param frmTokenAddress Deployed GameToken address
    /// @param seedNftAddress Deployed SeedNFT address
    constructor(address frmTokenAddress, address seedNftAddress) Ownable(msg.sender) {
        // Store immutable references to external contracts
        frmToken = GameToken(frmTokenAddress); // Set FRM token reference
        seedNft = SeedNFT(seedNftAddress); // Set Seed NFT reference
    }

    // --- Admin setters (optional, for balancing) ---

    /// @notice Update base prices for seeds; owner can rebalance the economy if needed
    /// @param wheat New base price for wheat (18 decimals)
    /// @param corn New base price for corn (18 decimals)
    /// @param rice New base price for rice (18 decimals)
    function setBasePrices(uint256 wheat, uint256 corn, uint256 rice) external onlyOwner {
        basePriceWheat = wheat; // Update wheat base price
        basePriceCorn = corn; // Update corn base price
        basePriceRice = rice; // Update rice base price
    }

    // --- Registration ---

    /// @notice Register a new player: grant 100 FRM and one seed of each type
    function registerPlayer() external nonReentrant {
        // Prevent duplicate registration and reward claims
        require(!isRegistered[msg.sender], "Already registered"); // Ensure one-time registration

        // Mark as registered immediately to avoid reentrancy issues
        isRegistered[msg.sender] = true; // Set registration flag

        // Mint initial FRM tokens to the player (100 FRM with 18 decimals)
        frmToken.mintTo(msg.sender, 100 ether); // Initial currency for new players

        // Mint a starter pack: one seed NFT of each type to the player
        seedNft.mintSeed(msg.sender, SeedNFT.SeedType.Wheat, starterURIWheat); // Starter wheat seed
        seedNft.mintSeed(msg.sender, SeedNFT.SeedType.Corn, starterURICorn); // Starter corn seed
        seedNft.mintSeed(msg.sender, SeedNFT.SeedType.Rice, starterURIRice); // Starter rice seed

        // Initialize the player's weather event immediately
        _updateEventInternal(msg.sender); // Set initial event state

        // Emit registration event
        emit PlayerRegistered(msg.sender); // Log new player registration
    }

    /// @notice Owner can set or adjust default starter URIs used at registration
    function setStarterURIs(string calldata wheat, string calldata corn, string calldata rice) external onlyOwner {
        starterURIWheat = wheat; // Update wheat starter URI
        starterURICorn = corn; // Update corn starter URI
        starterURIRice = rice; // Update rice starter URI
    }

    // --- Purchasing ---

    /// @notice Buy a seed NFT of a given type using FRM, price adjusted by the current event
    /// @param seedType Seed type to buy
    /// @param tokenURI_ Metadata URI to assign to the new NFT
    function buySeed(SeedType seedType, string calldata tokenURI_) external nonReentrant {
        // Require registration to participate in the economy
        require(isRegistered[msg.sender], "Register first"); // Ensure player exists

        // Update weather event if the interval has passed to apply up-to-date pricing
        _updateEventIfNeeded(msg.sender); // Keep event state current

        // Compute price based on type and current event
        uint256 price = _currentPriceFor(msg.sender, seedType); // Price in FRM with 18 decimals

        // Pull FRM from the player (requires prior approval to this contract)
        bool ok = IERC20(address(frmToken)).transferFrom(msg.sender, address(this), price); // Transfer FRM to game treasury
        require(ok, "FRM transfer failed"); // Ensure payment succeeded

        // Mint the seed NFT to the buyer
        uint256 tokenId = seedNft.mintSeed(msg.sender, _toSeedNftEnum(seedType), tokenURI_); // Mint and capture token ID

        // Emit purchase event for off-chain tracking (e.g., Backpack)
        emit SeedPurchased(msg.sender, seedType, price, tokenId); // Log the purchase
    }

    // --- Planting ---

    /// @notice Plant a seed NFT into the player's field grid; NFT is escrowed here until harvest
    /// @param x Column coordinate (0..7)
    /// @param y Row coordinate (0..5)
    /// @param tokenId The NFT to plant (caller must own and approve it)
    function plantSeed(uint256 x, uint256 y, uint256 tokenId) external nonReentrant {
        // Validate grid coordinates
        require(x < FIELD_WIDTH && y < FIELD_HEIGHT, "Out of bounds"); // Inside field

        // Calculate linear cell index for storage
        uint256 idx = _cellIndex(x, y); // Convert (x,y) to single index

        // Ensure the target cell is empty
        require(!field[msg.sender][idx].occupied, "Cell occupied"); // Only one seed per cell

        // Verify ownership and approval to move the NFT into escrow
        IERC721(address(seedNft)).safeTransferFrom(msg.sender, address(this), tokenId); // Transfer seed into escrow (requires approval)

        // Determine the seed type for the planted token
        SeedType st = _fromSeedNftEnum(seedNft.seedTypeOf(tokenId)); // Read type from NFT contract

        // Record the planting state for this cell
        field[msg.sender][idx] = Planted({
            tokenId: tokenId, // Store planted token ID
            seedType: st, // Store seed type
            plantedAt: uint64(block.timestamp), // Save plant time for maturity check
            occupied: true // Mark cell as used
        });

        // Emit planting event for client-side state sync
        emit SeedPlanted(msg.sender, x, y, idx, tokenId, st); // Log plant action
    }

    // --- Harvesting ---

    /// @notice Harvest a matured plant: burn the planted NFT and mint two new NFTs of the same type
    /// @param x Column coordinate (0..7)
    /// @param y Row coordinate (0..5)
    /// @param tokenURI1 Metadata URI for the first new NFT
    /// @param tokenURI2 Metadata URI for the second new NFT
    function harvest(uint256 x, uint256 y, string calldata tokenURI1, string calldata tokenURI2) external nonReentrant {
        // Validate grid coordinates
        require(x < FIELD_WIDTH && y < FIELD_HEIGHT, "Out of bounds"); // Inside field

        // Calculate linear cell index for storage
        uint256 idx = _cellIndex(x, y); // Convert (x,y) to single index

        // Ensure there's a planted seed in this cell owned by the caller's field
        Planted memory planted = field[msg.sender][idx]; // Load planted state
        require(planted.occupied, "Empty cell"); // Require something to harvest

        // Ensure sufficient time has passed to harvest
        require(block.timestamp >= planted.plantedAt + PLANT_MATURITY_SECONDS, "Not matured"); // Enforce 1-minute growth

        // Burn the old planted NFT (escrowed in this contract) via the SeedNFT contract
        seedNft.burn(planted.tokenId); // Remove old seed

        // Clear the cell state before minting to avoid reentrancy issues
        delete field[msg.sender][idx]; // Reset cell to empty state

        // Mint two new NFTs of the same seed type to the player as harvest yield
        uint256 newId1 = seedNft.mintSeed(msg.sender, _toSeedNftEnum(planted.seedType), tokenURI1); // First new NFT
        uint256 newId2 = seedNft.mintSeed(msg.sender, _toSeedNftEnum(planted.seedType), tokenURI2); // Second new NFT

        // Emit harvest event for client-side state sync and auditing
        emit SeedHarvested(msg.sender, x, y, idx, planted.tokenId, newId1, newId2, planted.seedType); // Log harvest
    }

    // --- Weather event management ---

    /// @notice Update the player's weather event if at least 2 minutes have elapsed
    function updateEvent() external {
        // Only update if the interval has elapsed to avoid spamming state changes
        _updateEventIfNeeded(msg.sender); // Update event if needed
    }

    /// @notice Get the current price for a seed type for the caller taking into account the current event
    /// @param seedType Seed type for which to compute price
    /// @return price Price in FRM (18 decimals)
    function getMySeedPrice(SeedType seedType) external view returns (uint256 price) {
        // Read current event (without state change) and compute price based on it
        (WeatherEvent we,) = _readCurrentEventView(msg.sender); // View-only event state
        price = _priceWithEvent(seedType, we); // Compute adjusted price
    }

    /// @notice Return a planted cell's data for UI convenience
    /// @param player Player address
    /// @param x Column coordinate
    /// @param y Row coordinate
    function getCell(address player, uint256 x, uint256 y) external view returns (Planted memory) {
        // Validate coordinates to avoid out-of-range access patterns in off-chain consumers
        require(x < FIELD_WIDTH && y < FIELD_HEIGHT, "Out of bounds"); // Range check
        return field[player][_cellIndex(x, y)]; // Return stored planted state
    }

    /// @notice Read the player's current weather event and when it was last updated
    /// @param player Address of the player
    /// @return currentEvent The current event
    /// @return lastUpdatedAt Timestamp when it last changed
    function getPlayerEvent(address player) external view returns (WeatherEvent currentEvent, uint64 lastUpdatedAt) {
        // Provide the event state for UI/logic without mutating
        PlayerEventState memory st = playerEventState[player]; // Load state
        return (st.currentEvent, st.lastUpdatedAt); // Return tuple
    }

    // --- Treasury management ---

    /// @notice Withdraw accumulated FRM from purchases to the owner (game treasury management)
    /// @param to Recipient address
    /// @param amount Amount in FRM (18 decimals) to withdraw
    function withdrawFRM(address to, uint256 amount) external onlyOwner {
        // Transfer FRM from the contract to the specified recipient
        bool ok = IERC20(address(frmToken)).transfer(to, amount); // Move funds
        require(ok, "Withdraw failed"); // Ensure success
    }

    // --- Internal helpers ---

    /// @dev Convert (x,y) coordinates into a linear cell index
    function _cellIndex(uint256 x, uint256 y) internal pure returns (uint256) {
        // Cell index is row-major: idx = y * width + x
        return y * FIELD_WIDTH + x; // Linearize coordinates
    }

    /// @dev Update player's event only if the interval has elapsed
    function _updateEventIfNeeded(address player) internal {
        // Read previous event state
        PlayerEventState memory st = playerEventState[player]; // Current value
        // Check time since last update
        if (block.timestamp < uint256(st.lastUpdatedAt) + EVENT_INTERVAL_SECONDS) {
            // Not enough time passed; do nothing
            return; // Early return to save gas
        }
        // Perform stateful update
        _updateEventInternal(player); // Update event and emit
    }

    /// @dev Internal function to compute and persist a new event for the player
    function _updateEventInternal(address player) internal {
        // Compute pseudo-random number using available on-chain entropy sources and the player's address
        uint256 rand = uint256(keccak256(abi.encode(block.prevrandao, block.timestamp, block.number, player))); // Derive randomness
        // Map random value into event distribution (70% Normal, 20% Rain, 10% Locust)
        uint256 roll = rand % 100; // Roll in range [0, 99]
        WeatherEvent newEvent = WeatherEvent.Normal; // Default
        if (roll < 70) {
            newEvent = WeatherEvent.Normal; // 70% probability
        } else if (roll < 90) {
            newEvent = WeatherEvent.Rain; // 20% probability
        } else {
            newEvent = WeatherEvent.Locust; // 10% probability
        }
        // Persist new event state
        playerEventState[player] = PlayerEventState({
            currentEvent: newEvent, // Save current event
            lastUpdatedAt: uint64(block.timestamp) // Save update timestamp
        });
        // Emit event update for off-chain consumers (e.g., Xsolla ZK Backpack)
        emit WeatherEventUpdated(player, newEvent, block.timestamp); // Log update
    }

    /// @dev Read-only helper to get the event that would apply at this block without mutating state
    function _readCurrentEventView(address player) internal view returns (WeatherEvent currentEvent, uint64 lastUpdatedAt) {
        // Load stored event state
        PlayerEventState memory st = playerEventState[player]; // Load state
        // If interval has elapsed, compute what the new event would be now for preview
        if (block.timestamp >= uint256(st.lastUpdatedAt) + EVENT_INTERVAL_SECONDS) {
            // Compute a preview pseudo-random event (same method as stateful update)
            uint256 rand = uint256(keccak256(abi.encode(block.prevrandao, block.timestamp, block.number, player))); // Entropy sources
            uint256 roll = rand % 100; // Map to 0..99
            if (roll < 70) {
                return (WeatherEvent.Normal, uint64(block.timestamp)); // Preview Normal
            } else if (roll < 90) {
                return (WeatherEvent.Rain, uint64(block.timestamp)); // Preview Rain
            } else {
                return (WeatherEvent.Locust, uint64(block.timestamp)); // Preview Locust
            }
        }
        // Otherwise return the stored event
        return (st.currentEvent, st.lastUpdatedAt); // Use last state
    }

    /// @dev Compute the price for a player and seed type using the current weather event
    function _currentPriceFor(address player, SeedType seedType) internal view returns (uint256) {
        // Get current or preview event to base pricing on
        (WeatherEvent we,) = _readCurrentEventView(player); // Read event state
        return _priceWithEvent(seedType, we); // Compute adjusted price
    }

    /// @dev Price calculation for a given seed type and event
    function _priceWithEvent(SeedType seedType, WeatherEvent we) internal view returns (uint256) {
        // Choose base price for the seed type
        uint256 base = basePriceWheat; // Default
        if (seedType == SeedType.Wheat) {
            base = basePriceWheat; // Wheat base price
        } else if (seedType == SeedType.Corn) {
            base = basePriceCorn; // Corn base price
        } else {
            base = basePriceRice; // Rice base price
        }
        // Choose multiplier based on event
        uint256 m = MULTIPLIER_NORMAL; // Default 1.00x
        if (we == WeatherEvent.Normal) {
            m = MULTIPLIER_NORMAL; // No change
        } else if (we == WeatherEvent.Rain) {
            m = MULTIPLIER_RAIN; // Discount
        } else {
            m = MULTIPLIER_LOCUST; // Surcharge
        }
        // Apply multiplier with integer math
        return (base * m) / 100; // Price in 18 decimals
    }

    /// @dev Convert local SeedType to SeedNFT.SeedType
    function _toSeedNftEnum(SeedType s) internal pure returns (SeedNFT.SeedType) {
        if (s == SeedType.Wheat) return SeedNFT.SeedType.Wheat; // Map to NFT enum
        if (s == SeedType.Corn) return SeedNFT.SeedType.Corn; // Map to NFT enum
        return SeedNFT.SeedType.Rice; // Map to NFT enum
    }

    /// @dev Convert SeedNFT.SeedType to local SeedType
    function _fromSeedNftEnum(SeedNFT.SeedType s) internal pure returns (SeedType) {
        if (s == SeedNFT.SeedType.Wheat) return SeedType.Wheat; // Map to local enum
        if (s == SeedNFT.SeedType.Corn) return SeedType.Corn; // Map to local enum
        return SeedType.Rice; // Map to local enum
    }

    /// @notice Implement ERC721 safe receiver so this contract can hold NFTs in escrow
    /// @dev Always accept tokens by returning the selector
    function onERC721Received(
        address /*operator*/,
        address /*from*/,
        uint256 /*tokenId*/,
        bytes calldata /*data*/
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector; // Indicate acceptance of ERC721 tokens
    }
}
