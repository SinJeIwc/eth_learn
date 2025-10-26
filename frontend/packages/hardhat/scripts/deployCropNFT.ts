import { ethers } from "hardhat";

async function main() {
  console.log("\n🌾 Deploying CropNFT to Status Sepolia...\n");

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Please set DEPLOYER_PRIVATE_KEY in environment");
  }

  const provider = new ethers.JsonRpcProvider("https://rpc.statusim.net");
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying from:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  const CropNFT = await ethers.getContractFactory("CropNFT", wallet);
  const cropNFT = await CropNFT.deploy(wallet.address);
  await cropNFT.waitForDeployment();

  const cropAddress = await cropNFT.getAddress();
  console.log("✅ CropNFT deployed at:", cropAddress);

  console.log("\n📝 Now update FarmMarketplace to use this CropNFT address");
  console.log("   Or authorize it manually:");
  console.log(`   cropNFT.setAuthorizedMinter(farmMarketplaceAddress, true)`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
