// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CropNFT
 * @notice NFT representing harvested crops (урожай)
 * @dev Separate from PlantNFT - represents the harvested product
 */
contract CropNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    
    enum CropType { WHEAT, GRAPE, PUMPKIN }
    
    struct Crop {
        CropType cropType;
        uint256 quality; // 0-1000 (based on plant health when harvested)
        uint256 harvestedAt;
        address harvester;
    }
    
    mapping(uint256 => Crop) public crops;
    mapping(address => bool) public authorizedMinters;
    
    event CropMinted(uint256 indexed tokenId, address indexed owner, CropType cropType, uint256 quality);
    event CropBurned(uint256 indexed tokenId, address indexed owner);
    
    constructor(address initialOwner) 
        ERC721("Farm Crop", "CROP") 
        Ownable(initialOwner)
    {
        authorizedMinters[initialOwner] = true;
    }
    
    /**
     * @notice Authorize a contract to mint crops
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
    }
    
    /**
     * @notice Mint a crop NFT (called by FarmMarketplace after harvest)
     */
    function mint(
        address to,
        CropType cropType,
        uint256 quality
    ) external returns (uint256) {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(quality <= 1000, "Invalid quality");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        crops[tokenId] = Crop({
            cropType: cropType,
            quality: quality,
            harvestedAt: block.timestamp,
            harvester: to
        });
        
        emit CropMinted(tokenId, to, cropType, quality);
        return tokenId;
    }
    
    /**
     * @notice Burn crop NFT (when sold)
     */
    function burn(uint256 tokenId) external {
        require(authorizedMinters[msg.sender] || ownerOf(tokenId) == msg.sender, "Not authorized");
        address owner = ownerOf(tokenId);
        _burn(tokenId);
        delete crops[tokenId];
        emit CropBurned(tokenId, owner);
    }
    
    /**
     * @notice Get crop details
     */
    function getCrop(uint256 tokenId) external view returns (Crop memory) {
        require(ownerOf(tokenId) != address(0), "Crop does not exist");
        return crops[tokenId];
    }
    
    /**
     * @notice Get all crops owned by address
     */
    function getCropsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < _nextTokenId && currentIndex < balance; i++) {
            try this.ownerOf(i) returns (address tokenOwner) {
                if (tokenOwner == owner) {
                    tokenIds[currentIndex] = i;
                    currentIndex++;
                }
            } catch {
                continue;
            }
        }
        
        return tokenIds;
    }
}
