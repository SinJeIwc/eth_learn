import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFaucet: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Get FarmCoin address
  const farmCoin = await hre.deployments.get("FarmCoin");

  console.log("\n🚰 Deploying FarmCoinFaucet...");

  // Deploy Faucet
  const faucet = await deploy("FarmCoinFaucet", {
    from: deployer,
    args: [farmCoin.address],
    log: true,
    autoMine: true,
  });

  console.log(`✅ FarmCoinFaucet deployed at: ${faucet.address}`);

  // Authorize Faucet to mint FarmCoin
  const farmCoinContract = await hre.ethers.getContractAt("FarmCoin", farmCoin.address);

  console.log("🔓 Authorizing Faucet as minter...");
  const tx = await farmCoinContract.setAuthorizedMinter(faucet.address, true);
  await tx.wait();

  console.log("✅ Faucet authorized!");
  console.log("\n💡 Players can now call claimStarterTokens() to get 50 FarmCoin!");
};

export default deployFaucet;

deployFaucet.tags = ["FarmCoinFaucet", "faucet"];
deployFaucet.dependencies = ["FarmCoin"];
