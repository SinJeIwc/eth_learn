'use client';

import { useGameStore } from '../store/gameStore';

export default function WalletConnect() {
  const { address, connected, loading, error, connect, disconnect } = useGameStore();

  if (connected && address) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 bg-green-500 text-white rounded-lg">
        <span>🟢 {address.slice(0, 6)}...{address.slice(-4)}</span>
        <button
          onClick={disconnect}
          className="px-4 py-1 bg-red-500 hover:bg-red-600 rounded"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connect}
        disabled={loading}
        className={`px-6 py-3 rounded-lg font-bold text-white ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? '⏳ Connecting...' : '🦊 Connect Wallet'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
