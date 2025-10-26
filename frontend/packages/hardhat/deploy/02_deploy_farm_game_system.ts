import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the complete Farm Game contract system
 *
 * Contract chain:
 * 1. FarmCoin (ERC20) - In-game currency
 * 2. PlantNFT (ERC721) - Plant tokens
 * 3. CropNFT (ERC721) - Harvested crop tokens
 * 4. FarmLand (ERC721) - Land plots
 * 5. GameEvents - Random event generator
 * 6. GameEffects - Applies event effects
 * 7. PriceOracle - Dynamic pricing
 * 8. FarmMarketplace - Main game contract
 */
const deployFarmGameSystem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🌾 Deploying Farm Game System...\n");

  // 1️⃣ Deploy FarmCoin (ERC20)
  console.log("💰 Deploying FarmCoin...");
  const farmCoin = await deploy("FarmCoin", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  console.log("✅ FarmCoin deployed at:", farmCoin.address);

  // 2️⃣ Deploy PlantNFT (ERC721)
  console.log("\n🌱 Deploying PlantNFT...");
  const plantNFT = await deploy("PlantNFT", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  console.log("✅ PlantNFT deployed at:", plantNFT.address);

  // 3️⃣ Deploy FarmLand (ERC721)
  console.log("\n🏞️  Deploying FarmLand...");
  const farmLand = await deploy("FarmLand", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  console.log("✅ FarmLand deployed at:", farmLand.address);

  // 4️⃣ Deploy GameEvents
  console.log("\n🎲 Deploying GameEvents...");
  const gameEvents = await deploy("GameEvents", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  console.log("✅ GameEvents deployed at:", gameEvents.address);

  // 5️⃣ Deploy PriceOracle (before GameEffects since GameEffects needs it)
  console.log("\n� Deploying PriceOracle...");
  const priceOracle = await deploy("PriceOracle", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  console.log("✅ PriceOracle deployed at:", priceOracle.address);

  // 6️⃣ Deploy GameEffects
  console.log("\n� Deploying GameEffects...");
  const gameEffects = await deploy("GameEffects", {
    from: deployer,
    args: [deployer, plantNFT.address, priceOracle.address],
    log: true,
    autoMine: true,
  });
  console.log("✅ GameEffects deployed at:", gameEffects.address);

  // 7️⃣ Get CropNFT (deployed in 01a script)
  console.log("\n🌾 Getting CropNFT...");
  const cropNFT = await hre.deployments.get("CropNFT");
  console.log("✅ CropNFT found at:", cropNFT.address);

  // 8️⃣ Deploy FarmMarketplace
  console.log("\n🏪 Deploying FarmMarketplace...");
  const farmMarketplace = await deploy("FarmMarketplace", {
    from: deployer,
    args: [
      deployer,
      farmCoin.address,
      plantNFT.address,
      cropNFT.address, // ← Added CropNFT
      farmLand.address,
      gameEvents.address,
      gameEffects.address,
      priceOracle.address,
    ],
    log: true,
    autoMine: true,
  });
  console.log("✅ FarmMarketplace deployed at:", farmMarketplace.address);

  // 🔗 Setup contract connections
  console.log("\n🔗 Setting up contract connections...");

  const FarmCoin = await hre.ethers.getContractAt("FarmCoin", farmCoin.address);
  const PlantNFT = await hre.ethers.getContractAt("PlantNFT", plantNFT.address);
  const CropNFT = await hre.ethers.getContractAt("CropNFT", cropNFT.address);
  const FarmLand = await hre.ethers.getContractAt("FarmLand", farmLand.address);
  const GameEffects = await hre.ethers.getContractAt("GameEffects", gameEffects.address);
  const PriceOracle = await hre.ethers.getContractAt("PriceOracle", priceOracle.address);

  // Authorize FarmMarketplace to mint/burn FarmCoin
  console.log("  - Authorizing FarmMarketplace to mint/burn FarmCoin...");
  await FarmCoin.setAuthorizedMinter(farmMarketplace.address, true);

  // Authorize FarmMarketplace to manage PlantNFT
  console.log("  - Authorizing FarmMarketplace to manage PlantNFT...");
  await PlantNFT.setAuthorizedManager(farmMarketplace.address, true);

  // Authorize FarmMarketplace to manage CropNFT
  console.log("  - Authorizing FarmMarketplace to manage CropNFT...");
  await CropNFT.setAuthorizedMinter(farmMarketplace.address, true);

  // Authorize FarmMarketplace to manage FarmLand
  console.log("  - Authorizing FarmMarketplace to manage FarmLand...");
  await FarmLand.setAuthorizedManager(farmMarketplace.address, true);

  // Authorize GameEffects to update plant health
  console.log("  - Authorizing GameEffects to update PlantNFT...");
  await PlantNFT.setAuthorizedManager(gameEffects.address, true);

  // Authorize GameEffects to update land fertility
  console.log("  - Authorizing GameEffects to update FarmLand...");
  await FarmLand.setAuthorizedManager(gameEffects.address, true);

  // Authorize GameEffects to update PriceOracle
  console.log("  - Authorizing GameEffects to update PriceOracle...");
  await PriceOracle.setAuthorizedManager(gameEffects.address, true);

  console.log("\n✅ All connections established!");

  console.log("\n🎉 Farm Game System deployed successfully!\n");
  console.log("📝 Contract Addresses:");
  console.log("   FarmCoin:        ", farmCoin.address);
  console.log("   PlantNFT:        ", plantNFT.address);
  console.log("   CropNFT:         ", cropNFT.address);
  console.log("   FarmLand:        ", farmLand.address);
  console.log("   GameEvents:      ", gameEvents.address);
  console.log("   GameEffects:     ", gameEffects.address);
  console.log("   PriceOracle:     ", priceOracle.address);
  console.log("   FarmMarketplace: ", farmMarketplace.address);

  console.log("\n🔥 Chain Reaction Flow:");
  console.log("   1. Player triggers event → GameEvents");
  console.log("   2. Event generates → GameEffects applies to plants/land");
  console.log("   3. Effects update → PriceOracle recalculates prices");
  console.log("   4. Prices change → Marketplace uses new prices");
  console.log("\n");
};

export default deployFarmGameSystem;

deployFarmGameSystem.tags = ["FarmGameSystem"];
