import { create } from 'zustand';

interface Plot {
  id: number;
  isOwned: boolean;
  isOccupied: boolean;
  seedId: number;
  plantedAt: number;
  readyAt: number;
  progress?: number;
}

interface PlayerStats {
  level: number;
  experience: number;
  gold: number;
  totalHarvests: number;
}

interface GameStore {
  // State
  plots: Plot[];
  playerStats: PlayerStats | null;
  items: any[];
  selectedPlot: number | null;
  isLoading: boolean;
  
  // Actions
  setPlots: (plots: Plot[]) => void;
  setPlayerStats: (stats: PlayerStats) => void;
  setItems: (items: any[]) => void;
  setSelectedPlot: (plotId: number | null) => void;
  setLoading: (loading: boolean) => void;
  updatePlotProgress: (plotId: number, progress: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  plots: [],
  playerStats: null,
  items: [],
  selectedPlot: null,
  isLoading: false,
  
  setPlots: (plots) => set({ plots }),
  setPlayerStats: (playerStats) => set({ playerStats }),
  setItems: (items) => set({ items }),
  setSelectedPlot: (selectedPlot) => set({ selectedPlot }),
  setLoading: (isLoading) => set({ isLoading }),
  
  updatePlotProgress: (plotId, progress) => set((state) => ({
    plots: state.plots.map((plot) =>
      plot.id === plotId ? { ...plot, progress } : plot
    ),
  })),
  
  reset: () => set({
    plots: [],
    playerStats: null,
    items: [],
    selectedPlot: null,
    isLoading: false,
  }),
}));
