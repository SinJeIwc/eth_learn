import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"; // Import ignition helpers

// Deploy and wire the game contracts: GameToken, SeedNFT, FarmGame
export default buildModule("FarmGameModule", (m) => {
  // Deploy ERC20 token (FRM) and ERC721 (SEED)
  const gameToken = m.contract("GameToken"); // Deploy GameToken
  const seedNft = m.contract("SeedNFT"); // Deploy SeedNFT

  // Deploy FarmGame with addresses of token and NFT
  const farmGame = m.contract("FarmGame", [gameToken, seedNft]); // Pass dependencies

  // Wire permissions: set farmGame as minter/burner in token/NFT
  m.call(gameToken, "setGameContract", [farmGame]); // Allow game to mint FRM
  m.call(seedNft, "setGameContract", [farmGame]); // Allow game to mint/burn NFTs

  return { gameToken, seedNft, farmGame }; // Export deployed instances
});
