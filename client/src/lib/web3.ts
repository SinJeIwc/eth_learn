import { ethers } from 'ethers';
import GameTokenABI from '../contracts/GameToken.json';
import FarmGameABI from '../contracts/FarmGame.json';
import addresses from '../contracts/addresses.json';

export interface PlayerInfo {
  level: number;
  experience: number;
  plotCount: number;
  initialized: boolean;
}

export interface PlotInfo {
  seedId: number;
  plantedAt: number;
  harvestTime: number;
  harvested: boolean;
  canHarvest: boolean;
  progress: number;
}

export interface SeedInfo {
  name: string;
  price: string;
  growthTime: number;
  baseYield: number;
}

export class Web3Service {
  provider: ethers.BrowserProvider | null = null;
  signer: ethers.Signer | null = null;
  address: string | null = null;
  tokenContract: ethers.Contract | null = null;
  gameContract: ethers.Contract | null = null;

  async connect(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.address = await this.signer.getAddress();

    this.tokenContract = new ethers.Contract(
      addresses.token,
      GameTokenABI.abi,
      this.signer
    );

    this.gameContract = new ethers.Contract(
      addresses.game,
      FarmGameABI.abi,
      this.signer
    );

    return this.address;
  }

  async getTokenBalance(): Promise<string> {
    if (!this.tokenContract || !this.address) return '0';
    const balance = await this.tokenContract.balanceOf(this.address);
    return ethers.formatEther(balance);
  }

  async approveToken(amount: string | number): Promise<ethers.ContractTransactionReceipt> {
    if (!this.tokenContract) throw new Error('Not connected');
    const tx = await this.tokenContract.approve(
      addresses.game,
      ethers.parseEther(amount.toString())
    );
    return await tx.wait();
  }

  async initializePlayer(): Promise<ethers.ContractTransactionReceipt> {
    if (!this.gameContract) throw new Error('Not connected');
    const tx = await this.gameContract.initializePlayer();
    return await tx.wait();
  }

  async getPlayerInfo(): Promise<PlayerInfo> {
    if (!this.gameContract || !this.address) throw new Error('Not connected');
    const info = await this.gameContract.getPlayerInfo(this.address);
    return {
      level: Number(info.level),
      experience: Number(info.experience),
      plotCount: Number(info.plotCount),
      initialized: info.initialized
    };
  }

  async buySeed(seedId: number, quantity: number): Promise<ethers.ContractTransactionReceipt> {
    if (!this.gameContract) throw new Error('Not connected');
    const tx = await this.gameContract.buySeed(seedId, quantity);
    return await tx.wait();
  }

  async plantSeed(plotId: number, seedId: number): Promise<ethers.ContractTransactionReceipt> {
    if (!this.gameContract) throw new Error('Not connected');
    const tx = await this.gameContract.plantSeed(plotId, seedId);
    return await tx.wait();
  }

  async harvest(plotId: number): Promise<ethers.ContractTransactionReceipt> {
    if (!this.gameContract) throw new Error('Not connected');
    const tx = await this.gameContract.harvest(plotId);
    return await tx.wait();
  }

  async buyPlot(): Promise<ethers.ContractTransactionReceipt> {
    if (!this.gameContract) throw new Error('Not connected');
    const tx = await this.gameContract.buyPlot();
    return await tx.wait();
  }

  async getPlotInfo(plotId: number): Promise<PlotInfo> {
    if (!this.gameContract || !this.address) throw new Error('Not connected');
    const info = await this.gameContract.getPlotInfo(this.address, plotId);
    return {
      seedId: Number(info.seedId),
      plantedAt: Number(info.plantedAt),
      harvestTime: Number(info.harvestTime),
      harvested: info.harvested,
      canHarvest: info.canHarvest,
      progress: Number(info.progress)
    };
  }

  async getInventory(seedId: number): Promise<number> {
    if (!this.gameContract || !this.address) throw new Error('Not connected');
    const amount = await this.gameContract.getInventory(this.address, seedId);
    return Number(amount);
  }

  async getSeed(seedId: number): Promise<SeedInfo> {
    if (!this.gameContract) throw new Error('Not connected');
    const seed = await this.gameContract.seeds(seedId);
    return {
      name: seed.name,
      price: ethers.formatEther(seed.price),
      growthTime: Number(seed.growthTime),
      baseYield: Number(seed.baseYield)
    };
  }
}

export const web3Service = new Web3Service();
