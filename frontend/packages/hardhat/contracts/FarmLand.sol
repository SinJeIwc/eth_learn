// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FarmLand
 * @notice ERC721 NFT representing land plots (8x6 grid = 48 plots)
 */
contract FarmLand is ERC721, Ownable {
    uint256 public constant MAX_PLOTS = 48; // 8x6 grid
    uint256 private _nextTokenId;
    
    struct LandPlot {
        uint8 x;           // 0-7
        uint8 y;           // 0-5
        uint16 fertility;  // 0-1000
        uint256 ownedSince;
    }
    
    mapping(uint256 => LandPlot) public landPlots;
    mapping(address => bool) public authorizedManagers;
    
    event LandMinted(uint256 indexed tokenId, address indexed owner, uint8 x, uint8 y);
    event FertilityChanged(uint256 indexed tokenId, uint16 newFertility);
    event ManagerAuthorized(address indexed manager, bool authorized);
    
    constructor(address initialOwner) 
        ERC721("Farm Land", "LAND") 
        Ownable(initialOwner)
    {}
    
    modifier onlyAuthorized() {
        require(authorizedManagers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    /**
     * @notice Authorize a contract to manage land
     */
    function setAuthorizedManager(address manager, bool authorized) external onlyOwner {
        authorizedManagers[manager] = authorized;
        emit ManagerAuthorized(manager, authorized);
    }
    
    /**
     * @notice Mint a land plot NFT
     */
    function mint(address to, uint8 x, uint8 y) external onlyAuthorized returns (uint256) {
        require(_nextTokenId < MAX_PLOTS, "All plots minted");
        require(x < 8 && y < 6, "Invalid coordinates");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        landPlots[tokenId] = LandPlot({
            x: x,
            y: y,
            fertility: 1000,
            ownedSince: block.timestamp
        });
        
        emit LandMinted(tokenId, to, x, y);
        return tokenId;
    }
    
    /**
     * @notice Update land fertility (affected by events)
     */
    function updateFertility(uint256 tokenId, uint16 newFertility) external onlyAuthorized {
        require(newFertility <= 1000, "Fertility exceeds max");
        landPlots[tokenId].fertility = newFertility;
        emit FertilityChanged(tokenId, newFertility);
    }
    
    /**
     * @notice Get land plot info
     */
    function getLandPlot(uint256 tokenId) external view returns (LandPlot memory) {
        return landPlots[tokenId];
    }
    
    /**
     * @notice Get all land plots owned by address
     */
    function getLandsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory ownedTokenIds = new uint256[](balance);
        
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_ownerOf(i) == owner) {
                ownedTokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return ownedTokenIds;
    }
}
