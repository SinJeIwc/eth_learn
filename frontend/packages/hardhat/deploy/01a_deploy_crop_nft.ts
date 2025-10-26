import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys CropNFT contract for harvested crops
 * Must be deployed BEFORE FarmMarketplace
 */
const deployCropNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🌾 Deploying CropNFT...");
  await deploy("CropNFT", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  const cropNFT = await hre.ethers.getContract<any>("CropNFT", deployer);
  console.log("✅ CropNFT deployed at:", await cropNFT.getAddress());
};

export default deployCropNFT;

deployCropNFT.tags = ["CropNFT"];
// No dependencies - should deploy early
