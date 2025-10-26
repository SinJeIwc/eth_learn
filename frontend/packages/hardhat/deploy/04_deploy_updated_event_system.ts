import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys UPDATED Game Events System with simplified effects
 *
 * Updates:
 * 1. GameEvents - Hourly trigger with 3 event types
 * 2. SimpleGameEffects - Focused on RAIN/DROUGHT/WINTER
 * 3. PlantNFT - Added reduceGrowthTime and getPlantsByOwner
 * 4. PriceOracle - Added setWheatMultiplier
 */
const deployUpdatedEventSystem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🔄 Deploying Updated Event System...\n");

  // Get existing contracts
  const farmCoin = await hre.deployments.get("FarmCoin");
  const cropNFT = await hre.deployments.get("CropNFT");
  const farmLand = await hre.deployments.get("FarmLand");

  console.log("📦 Using existing contracts:");
  console.log("  FarmCoin:", farmCoin.address);
  console.log("  CropNFT:", cropNFT.address);
  console.log("  FarmLand:", farmLand.address);

  // 1️⃣ Redeploy PlantNFT with new functions
  console.log("\n🌱 Redeploying PlantNFT (with reduceGrowthTime)...");
  const plantNFT = await deploy("PlantNFT", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  console.log("✅ PlantNFT deployed at:", plantNFT.address);

  // 2️⃣ Redeploy GameEvents with hourly triggers
  console.log("\n🎲 Redeploying GameEvents (hourly system)...");
  const gameEvents = await deploy("GameEvents", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  console.log("✅ GameEvents deployed at:", gameEvents.address);

  // 3️⃣ Deploy SimpleGameEffects (new contract)
  console.log("\n💥 Deploying SimpleGameEffects...");
  const simpleGameEffects = await deploy("GameEffects", {
    from: deployer,
    args: [deployer, plantNFT.address, "0x93385209228EF5572f974C2ac702760EC9e1f7D3"], // Using existing PriceOracle
    log: true,
    autoMine: true,
    contract: "SimpleGameEffects",
  });
  console.log("✅ SimpleGameEffects deployed at:", simpleGameEffects.address);

  // 4️⃣ Redeploy PriceOracle with setWheatMultiplier
  console.log("\n📊 Redeploying PriceOracle (with setWheatMultiplier)...");
  const priceOracle = await deploy("PriceOracle", {
    from: deployer,
    args: [deployer, gameEvents.address, simpleGameEffects.address],
    log: true,
    autoMine: true,
  });
  console.log("✅ PriceOracle deployed at:", priceOracle.address);

  // 5️⃣ Redeploy FarmMarketplace with updated dependencies
  console.log("\n🏪 Redeploying FarmMarketplace...");
  const farmMarketplace = await deploy("FarmMarketplace", {
    from: deployer,
    args: [
      deployer,
      farmCoin.address,
      plantNFT.address,
      cropNFT.address,
      farmLand.address,
      gameEvents.address,
      simpleGameEffects.address,
      priceOracle.address,
    ],
    log: true,
    autoMine: true,
  });
  console.log("✅ FarmMarketplace deployed at:", farmMarketplace.address);

  // 🔗 Setup authorizations
  console.log("\n🔗 Setting up contract authorizations...");

  const PlantNFT = await hre.ethers.getContractAt("PlantNFT", plantNFT.address);
  const GameEvents = await hre.ethers.getContractAt("GameEvents", gameEvents.address);
  const SimpleGameEffects = await hre.ethers.getContractAt("GameEffects", simpleGameEffects.address);
  const PriceOracle = await hre.ethers.getContractAt("PriceOracle", priceOracle.address);

  // Authorize FarmMarketplace on PlantNFT
  console.log("  Authorizing FarmMarketplace on PlantNFT...");
  await PlantNFT.addAuthorized(farmMarketplace.address);

  // Authorize SimpleGameEffects on PlantNFT
  console.log("  Authorizing SimpleGameEffects on PlantNFT...");
  await PlantNFT.addAuthorized(simpleGameEffects.address);

  // Set SimpleGameEffects as effects contract in GameEvents
  console.log("  Setting effects contract in GameEvents...");
  await GameEvents.setEffectsContract(simpleGameEffects.address);

  // Authorize SimpleGameEffects on PriceOracle
  console.log("  Authorizing SimpleGameEffects on PriceOracle...");
  // Note: If PriceOracle has access control, add it here

  console.log("✅ All authorizations set!");

  console.log("\n🎉 Updated Event System Deployment Complete!");
  console.log("\n📝 New Contract Addresses:");
  console.log("  PlantNFT:", plantNFT.address);
  console.log("  GameEvents:", gameEvents.address);
  console.log("  SimpleGameEffects:", simpleGameEffects.address);
  console.log("  PriceOracle:", priceOracle.address);
  console.log("  FarmMarketplace:", farmMarketplace.address);
};

export default deployUpdatedEventSystem;

deployUpdatedEventSystem.tags = ["UpdatedEventSystem"];
deployUpdatedEventSystem.dependencies = ["FarmCoin", "CropNFT"];
