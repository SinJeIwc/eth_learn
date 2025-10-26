"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/**
 * Hook для проверки стартовых токенов игрока
 * - Читает баланс FarmCoin
 * - Показывает сообщение если баланс = 0
 */
export const usePlayerInit = () => {
  const { address, isConnected } = useAccount();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Читаем баланс FarmCoin
  const { data: coinBalance, isLoading: isLoadingBalance } = useScaffoldReadContract({
    contractName: "FarmCoin",
    functionName: "balanceOf",
    args: [address],
  });

  useEffect(() => {
    if (!isConnected || !address || isLoadingBalance || hasShownWelcome) {
      return;
    }

    const balance = coinBalance ? Number(coinBalance) : 0;

    // Если баланс = 0, показываем приветствие (только один раз)
    if (balance === 0 && !hasShownWelcome) {
      setHasShownWelcome(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected, coinBalance, isLoadingBalance]);

  const balance = coinBalance ? Number(coinBalance) : 0;

  return {
    isInitializing: false,
    isInitialized: true,
    coinBalance: balance / 1e18,
    isNewPlayer: isConnected && balance === 0 && !isLoadingBalance,
    isLoading: isLoadingBalance,
  };
};
