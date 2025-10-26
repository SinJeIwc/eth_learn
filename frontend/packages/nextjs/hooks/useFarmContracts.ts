"use client";

import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const useFarmContracts = () => {
  const { address } = useAccount();
  const { writeContractAsync: writeFarmCoin } = useScaffoldWriteContract("FarmCoin");
  const { writeContractAsync: writeFarmMarketplace } = useScaffoldWriteContract("FarmMarketplace");

  const { data: coinBalance } = useScaffoldReadContract({
    contractName: "FarmCoin",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: plantBalance } = useScaffoldReadContract({
    contractName: "PlantNFT",
    functionName: "balanceOf",
    args: [address],
  });

  const cropBalance = 0;

  const { data: landBalance } = useScaffoldReadContract({
    contractName: "FarmLand",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: playerStatus } = useScaffoldReadContract({
    contractName: "FarmMarketplace",
    functionName: "getPlayerStatus",
    args: [address],
  });

  const buySeeds = async (cropType: string, quantity: number) => {
    try {
      const seedTypeMap: { [key: string]: number } = {
        wheat: 0,
        grape: 1,
        pumpkin: 2,
      };

      const seedType = seedTypeMap[cropType.toLowerCase()];
      if (seedType === undefined) {
        throw new Error(`Unknown crop type: ${cropType}`);
      }

      await writeFarmMarketplace({
        functionName: "buySeed",
        args: [seedType, BigInt(quantity)],
      });

      return true;
    } catch (error) {
      console.error("Error buying seeds:", error);
      throw error;
    }
  };

  const plantSeed = async (seedType: number) => {
    try {
      await writeFarmMarketplace({
        functionName: "plantSeed",
        args: [seedType],
      });
      return true;
    } catch (error) {
      console.error("Error planting seed:", error);
      throw error;
    }
  };

  const harvestCrop = async (plantTokenId: number) => {
    try {
      await writeFarmMarketplace({
        functionName: "harvestCrop",
        args: [BigInt(plantTokenId)],
      });
      return true;
    } catch (error) {
      console.error("Error harvesting crop:", error);
      throw error;
    }
  };

  const sellCrop = async (cropTokenId: number) => {
    try {
      console.log("sellCrop not yet deployed, cropTokenId:", cropTokenId);
      return true;
    } catch (error) {
      console.error("Error selling crop:", error);
      throw error;
    }
  };

  const triggerRandomEvent = async () => {
    try {
      await writeFarmMarketplace({
        functionName: "triggerRandomEvent",
      });
      return true;
    } catch (error) {
      console.error("Error triggering event:", error);
      throw error;
    }
  };

  const approveFarmCoin = async (amount: bigint) => {
    try {
      await writeFarmCoin({
        functionName: "approve",
        args: ["0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575", amount],
      });
      return true;
    } catch (error) {
      console.error("Error approving FarmCoin:", error);
      throw error;
    }
  };

  return {
    coinBalance: coinBalance ? Number(coinBalance) / 1e18 : 0,
    plantBalance: plantBalance ? Number(plantBalance) : 0,
    cropBalance: cropBalance ? Number(cropBalance) : 0,
    landBalance: landBalance ? Number(landBalance) : 0,
    playerStatus,

    buySeeds,
    plantSeed,
    harvestCrop,
    sellCrop,
    triggerRandomEvent,
    approveFarmCoin,
  };
};
