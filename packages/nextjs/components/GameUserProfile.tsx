"use client";

import { useEffect, useState } from "react";
import { XSOLLA_CONFIG } from "../config/xsolla";
import { UserData } from "../lib/auth";
import { getUserInfoFromToken, loadGameProgress } from "../lib/xsollaApi";

interface GameUserProfileProps {
  userData: UserData;
}

interface GameProgress {
  level: number;
  coins: number;
  inventory: any[];
  farmProgress: any;
  lastSave?: string;
}

export default function GameUserProfile({ userData }: GameUserProfileProps) {
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [xsollaUser, setXsollaUser] = useState<any>(null);

  useEffect(() => {
    console.log("🎮 GameUserProfile mounted with userData:", userData);

    if (userData.authType === "xsolla" && userData.xsollaToken) {
      // Get user info from token
      const userInfo = getUserInfoFromToken(userData.xsollaToken);
      setXsollaUser(userInfo);
      console.log("👤 Xsolla user info loaded:", userInfo);

      // Load game progress from Xsolla
      loadGameData();
    }
  }, [userData]);

  const loadGameData = async () => {
    if (!userData.xsollaToken) return;

    setIsLoading(true);
    try {
      const progress = await loadGameProgress(userData.xsollaToken, XSOLLA_CONFIG.LOGIN_ID, XSOLLA_CONFIG.PROJECT_ID);

      if (progress) {
        setGameProgress(progress);
        console.log("✅ Game progress loaded:", progress);
      }
    } catch (error) {
      console.error("Failed to load game progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-gray-900/90 text-white p-4 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700 min-w-[250px]">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-700">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
          {userData.username.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-bold text-sm truncate">{userData.username}</p>
          <p className="text-xs text-gray-400 truncate">{userData.email}</p>
        </div>
      </div>

      {/* Auth Type Badge */}
      <div className="mb-3">
        {userData.authType === "xsolla" && (
          <div className="flex items-center gap-2 text-xs bg-blue-600/20 border border-blue-500/30 rounded px-2 py-1">
            <span className="text-blue-400">🔐</span>
            <span className="text-blue-300">Xsolla Account</span>
          </div>
        )}
        {userData.authType === "xsolla-id" && (
          <div className="flex items-center gap-2 text-xs bg-purple-600/20 border border-purple-500/30 rounded px-2 py-1">
            <span className="text-purple-400">🆔</span>
            <span className="text-purple-300">Xsolla ID</span>
          </div>
        )}
        {userData.authType === "guest" && (
          <div className="flex items-center gap-2 text-xs bg-gray-600/20 border border-gray-500/30 rounded px-2 py-1">
            <span className="text-gray-400">👤</span>
            <span className="text-gray-300">Guest Mode</span>
          </div>
        )}
      </div>

      {/* Xsolla User Details */}
      {xsollaUser && (
        <div className="mb-3 pb-3 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-1">User ID</p>
          <p className="text-xs font-mono text-green-400 truncate">{xsollaUser.id}</p>
        </div>
      )}

      {/* Game Progress */}
      {userData.authType === "xsolla" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Cloud Save</span>
            {isLoading ? (
              <span className="text-yellow-400">⏳ Loading...</span>
            ) : gameProgress ? (
              <span className="text-green-400">✓ Synced</span>
            ) : (
              <button onClick={loadGameData} className="text-blue-400 hover:text-blue-300">
                Load Data
              </button>
            )}
          </div>

          {gameProgress && (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Level:</span>
                <span className="text-white font-bold">{gameProgress.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Coins:</span>
                <span className="text-yellow-400 font-bold">💰 {gameProgress.coins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Items:</span>
                <span className="text-purple-400 font-bold">{gameProgress.inventory.length}</span>
              </div>
              {gameProgress.lastSave && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Save:</span>
                  <span className="text-gray-500 text-[10px]">
                    {new Date(gameProgress.lastSave).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info for Guest Users */}
      {userData.authType === "guest" && (
        <div className="text-xs text-gray-400 bg-yellow-900/10 border border-yellow-500/20 rounded p-2">
          <p className="text-yellow-400 font-bold mb-1">⚠️ Local Mode</p>
          <p>Progress saved only on this device. Login with Xsolla for cloud save.</p>
        </div>
      )}
    </div>
  );
}
