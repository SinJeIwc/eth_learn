import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys Farm game contracts (Events -> Effects -> Market -> Orchestrator)
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployFarmContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🌾 Deploying Farm Game Contracts...\n");

  // 1. Deploy FarmEvents
  console.log("📅 Deploying FarmEvents...");
  const farmEvents = await deploy("FarmEvents", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log(`✅ FarmEvents deployed at: ${farmEvents.address}`);

  // 2. Deploy FarmEffects
  console.log("\n💥 Deploying FarmEffects...");
  const farmEffects = await deploy("FarmEffects", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log(`✅ FarmEffects deployed at: ${farmEffects.address}`);

  // 3. Deploy MarketManager
  console.log("\n💰 Deploying MarketManager...");
  const marketManager = await deploy("MarketManager", {
    from: deployer,
    args: [deployer], // initialOwner parameter for Ownable
    log: true,
    autoMine: true,
  });
  console.log(`✅ MarketManager deployed at: ${marketManager.address}`);

  // 4. Deploy FarmOrchestrator
  console.log("\n🎯 Deploying FarmOrchestrator...");
  const farmOrchestrator = await deploy("FarmOrchestrator", {
    from: deployer,
    args: [
      farmEvents.address,
      farmEffects.address,
      marketManager.address,
    ],
    log: true,
    autoMine: true,
  });
  console.log(`✅ FarmOrchestrator deployed at: ${farmOrchestrator.address}`);

  console.log("\n🎉 All Farm Game Contracts deployed successfully!\n");
  console.log("📝 Contract Addresses:");
  console.log(`   FarmEvents:       ${farmEvents.address}`);
  console.log(`   FarmEffects:      ${farmEffects.address}`);
  console.log(`   MarketManager:    ${marketManager.address}`);
  console.log(`   FarmOrchestrator: ${farmOrchestrator.address}`);
  console.log("\n");
};

export default deployFarmContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags FarmGame
deployFarmContracts.tags = ["FarmGame"];
