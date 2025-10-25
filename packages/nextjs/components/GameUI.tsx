"use client";

import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

export default function GameUI() {
  const {
    connected,
    player,
    balance,
    plots,
    inventory,
    seeds,
    loading,
    initializePlayer,
    loadSeeds,
    plantSeed,
    harvest,
    buySeed,
    buyPlot,
  } = useGameStore();

  useEffect(() => {
    if (connected) {
      loadSeeds();
    }
  }, [connected, loadSeeds]);

  if (!connected) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold mb-4">🌾 Farm Game</h2>
        <p>Connect your wallet to start playing</p>
      </div>
    );
  }

  if (!player.initialized) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-3xl font-bold mb-4">🏡 Welcome to Farm Game!</h1>
        <p className="mb-6">Initialize your farm to start growing</p>
        <button
          onClick={initializePlayer}
          disabled={loading}
          className="px-8 py-4 text-lg bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold disabled:bg-gray-400"
        >
          {loading ? "⏳ Initializing..." : "🌱 Start Farm (Free)"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-5 rounded-xl mb-6 flex justify-around flex-wrap gap-4">
        <div>
          <strong>Level:</strong> {player.level}
        </div>
        <div>
          <strong>Experience:</strong> {player.experience}
        </div>
        <div>
          <strong>Balance:</strong> 💰 {parseFloat(balance).toFixed(2)} FGOLD
        </div>
        <div>
          <strong>Plots:</strong> {player.plotCount}
        </div>
      </div>

      {/* Farm Grid */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">🌾 My Farm</h2>
          <button
            onClick={buyPlot}
            disabled={loading || player.plotCount >= 20}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:bg-gray-400"
          >
            ➕ Buy Plot (100 FGOLD)
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {plots.map(plot => (
            <div
              key={plot.id}
              className={`border-4 rounded-xl p-4 min-h-[200px] flex flex-col items-center justify-center ${
                plot.harvestTime === 0
                  ? "border-green-300 bg-green-50"
                  : plot.canHarvest
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-green-500 bg-green-100"
              }`}
            >
              {plot.harvestTime === 0 ? (
                <>
                  <div className="text-5xl mb-2">🌱</div>
                  <div className="text-sm">Empty Plot</div>
                  <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs">Plant</button>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-2">{plot.canHarvest ? "✨🌾" : "🌿"}</div>
                  <div className="text-xs">Seed #{plot.seedId}</div>
                  <div className="text-xs text-gray-600">Progress: {plot.progress}%</div>
                  {plot.canHarvest && (
                    <button
                      onClick={() => harvest(plot.id)}
                      disabled={loading}
                      className="mt-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                    >
                      🎉 Harvest
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shop */}
      <div>
        <h2 className="text-2xl font-bold mb-4">🛒 Seed Shop</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {seeds.map(seed => (
            <div key={seed.id} className="border-2 rounded-lg p-4 bg-white">
              <h3 className="font-bold text-lg mb-2">{seed.name}</h3>
              <p className="text-sm">💰 {seed.price} FGOLD</p>
              <p className="text-sm">⏱️ {seed.growthTime}s growth</p>
              <p className="text-sm">📦 Yield: {seed.baseYield}</p>
              {inventory[seed.id] && <p className="text-sm text-green-600">In stock: {inventory[seed.id]}</p>}
              <button
                onClick={() => buySeed(seed.id, 1)}
                disabled={loading}
                className="mt-3 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:bg-gray-400"
              >
                Buy Seed
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
