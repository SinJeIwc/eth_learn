import { create } from 'zustand';
import { web3Service, PlayerInfo, PlotInfo, SeedInfo } from '../lib/web3';

interface PlotWithId extends PlotInfo {
  id: number;
}

interface SeedWithId extends SeedInfo {
  id: number;
}

interface GameState {
  // Web3 State
  address: string | null;
  connected: boolean;
  balance: string;
  
  // Player State
  player: PlayerInfo;
  
  // Game State
  plots: PlotWithId[];
  inventory: Record<number, number>;
  seeds: SeedWithId[];
  
  // Loading States
  loading: boolean;
  error: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  loadPlayerData: () => Promise<void>;
  loadPlots: () => Promise<void>;
  loadInventory: () => Promise<void>;
  loadSeeds: () => Promise<void>;
  initializePlayer: () => Promise<void>;
  buySeed: (seedId: number, quantity: number) => Promise<void>;
  plantSeed: (plotId: number, seedId: number) => Promise<void>;
  harvest: (plotId: number) => Promise<void>;
  buyPlot: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  address: null,
  connected: false,
  balance: '0',
  player: {
    level: 0,
    experience: 0,
    plotCount: 0,
    initialized: false
  },
  plots: [],
  inventory: {},
  seeds: [],
  loading: false,
  error: null,

  // Actions
  connect: async () => {
    set({ loading: true, error: null });
    try {
      const address = await web3Service.connect();
      const balance = await web3Service.getTokenBalance();
      set({ address, connected: true, balance, loading: false });
      
      await get().loadPlayerData();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  disconnect: () => {
    set({
      address: null,
      connected: false,
      balance: '0',
      player: { level: 0, experience: 0, plotCount: 0, initialized: false },
      plots: [],
      inventory: {}
    });
  },

  loadPlayerData: async () => {
    try {
      const player = await web3Service.getPlayerInfo();
      set({ player });

      if (player.initialized) {
        await get().loadPlots();
        await get().loadInventory();
      }
    } catch (error) {
      console.error('Error loading player data:', error);
    }
  },

  loadPlots: async () => {
    const { player } = get();
    const plots: PlotWithId[] = [];
    
    for (let i = 0; i < player.plotCount; i++) {
      const plotInfo = await web3Service.getPlotInfo(i);
      plots.push({ id: i, ...plotInfo });
    }
    
    set({ plots });
  },

  loadInventory: async () => {
    const seedCount = 4;
    const inventory: Record<number, number> = {};
    
    for (let i = 0; i < seedCount; i++) {
      const amount = await web3Service.getInventory(i);
      if (amount > 0) {
        inventory[i] = amount;
      }
    }
    
    set({ inventory });
  },

  loadSeeds: async () => {
    const seedCount = 4;
    const seeds: SeedWithId[] = [];
    
    for (let i = 0; i < seedCount; i++) {
      const seed = await web3Service.getSeed(i);
      seeds.push({ id: i, ...seed });
    }
    
    set({ seeds });
  },

  initializePlayer: async () => {
    set({ loading: true });
    try {
      await web3Service.initializePlayer();
      await get().loadPlayerData();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  buySeed: async (seedId: number, quantity: number) => {
    set({ loading: true });
    try {
      await web3Service.buySeed(seedId, quantity);
      await get().loadInventory();
      const balance = await web3Service.getTokenBalance();
      set({ balance, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  plantSeed: async (plotId: number, seedId: number) => {
    set({ loading: true });
    try {
      await web3Service.plantSeed(plotId, seedId);
      await get().loadPlots();
      await get().loadInventory();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  harvest: async (plotId: number) => {
    set({ loading: true });
    try {
      await web3Service.harvest(plotId);
      await get().loadPlots();
      await get().loadPlayerData();
      const balance = await web3Service.getTokenBalance();
      set({ balance, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  buyPlot: async () => {
    set({ loading: true });
    try {
      await web3Service.buyPlot();
      await get().loadPlayerData();
      const balance = await web3Service.getTokenBalance();
      set({ balance, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  }
}));
