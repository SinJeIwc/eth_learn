// hooks/useFarmMarketplace.ts
'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import { useScaffoldEventHistory } from '~~/hooks/scaffold-eth';
import { notification } from '~~/utils/scaffold-eth';
import { useXsollaAuth } from './useXsollaAuth';

export function useFarmMarketplace() {
  const { address: connectedAddress } = useAccount();
  const { isAuthenticated, user } = useXsollaAuth();
  
  // Подключение к контрактам
  const { data: marketplace } = useScaffoldContract({
    contractName: 'FarmMarketplace',
  });

  const { data: farmCoin } = useScaffoldContract({
    contractName: 'FarmCoin',
  });

  const { data: priceOracle } = useScaffoldContract({
    contractName: 'PriceOracle',
  });

  // Читаем балансы и статус игрока
  const { data: playerStatus, refetch: refetchStatus } = useScaffoldReadContract({
    contractName: 'FarmMarketplace',
    functionName: 'getPlayerStatus',
    args: connectedAddress ? [connectedAddress] : undefined,
  });

  const { data: allPrices, refetch: refetchPrices } = useScaffoldReadContract({
    contractName: 'PriceOracle',
    functionName: 'getAllPrices',
  });

  // Write функции
  const { writeContractAsync: buySeedTx } = useScaffoldWriteContract('FarmMarketplace');
  const { writeContractAsync: plantSeedTx } = useScaffoldWriteContract('FarmMarketplace');
  const { writeContractAsync: harvestCropTx } = useScaffoldWriteContract('FarmMarketplace');
  const { writeContractAsync: triggerEventTx } = useScaffoldWriteContract('FarmMarketplace');

  // События
  const { data: eventHistory } = useScaffoldEventHistory({
    contractName: 'GameEvents',
    eventName: 'EventTriggered',
    fromBlock: 0n,
    watch: true,
  });

  const { data: priceUpdates } = useScaffoldEventHistory({
    contractName: 'PriceOracle',
    eventName: 'PricesUpdated',
    fromBlock: 0n,
    watch: true,
  });

  // Обновляем данные при новых событиях
  useEffect(() => {
    if (eventHistory && eventHistory.length > 0) {
      refetchStatus();
      refetchPrices();
      
      const latestEvent = eventHistory[eventHistory.length - 1];
      notification.info(`🎲 New event triggered!`);
    }
  }, [eventHistory, refetchStatus, refetchPrices]);

  useEffect(() => {
    if (priceUpdates && priceUpdates.length > 0) {
      notification.success('💰 Market prices updated!');
    }
  }, [priceUpdates]);

  // Проверка авторизации Xsolla
  const checkAuth = () => {
    if (!isAuthenticated) {
      notification.error('Please login with Xsolla first!');
      return false;
    }
    if (!connectedAddress) {
      notification.error('Please connect your wallet!');
      return false;
    }
    return true;
  };

  // Купить семена
  const buySeed = async (seedType: number, quantity: number) => {
    if (!checkAuth()) return;

    try {
      await buySeedTx({
        functionName: 'buySeed',
        args: [BigInt(seedType), BigInt(quantity)],
      });
      
      notification.success(`🌱 Bought ${quantity} seeds!`);
      await refetchStatus();
    } catch (error: any) {
      notification.error(`Failed to buy seeds: ${error.message}`);
    }
  };

  // Посадить семена
  const plantSeed = async (seedType: number, landTokenId: number) => {
    if (!checkAuth()) return;

    try {
      const tx = await plantSeedTx({
        functionName: 'plantSeed',
        args: [BigInt(seedType), BigInt(landTokenId)],
      });
      
      notification.success(`🌱 Seed planted successfully!`);
      await refetchStatus();
      return tx;
    } catch (error: any) {
      notification.error(`Failed to plant seed: ${error.message}`);
    }
  };

  // Собрать урожай
  const harvestCrop = async (plantTokenId: number) => {
    if (!checkAuth()) return;

    try {
      await harvestCropTx({
        functionName: 'harvestCrop',
        args: [BigInt(plantTokenId)],
      });
      
      notification.success(`🎉 Crop harvested! FarmCoins earned!`);
      await refetchStatus();
    } catch (error: any) {
      notification.error(`Failed to harvest: ${error.message}`);
    }
  };

  // Вызвать случайное событие (ЦЕПНАЯ РЕАКЦИЯ!)
  const triggerRandomEvent = async () => {
    if (!checkAuth()) return;

    try {
      notification.info('🎲 Triggering random event...');
      
      await triggerEventTx({
        functionName: 'triggerRandomEvent',
        args: [],
      });
      
      notification.success('⚡ Event triggered! Check effects and prices!');
      await refetchStatus();
      await refetchPrices();
    } catch (error: any) {
      notification.error(`Failed to trigger event: ${error.message}`);
    }
  };

  return {
    // Auth status
    isAuthenticated,
    xsollaUser: user,
    
    // Contracts
    marketplace,
    farmCoin,
    priceOracle,
    
    // Player data
    coinBalance: playerStatus?.[0],
    landCount: playerStatus?.[1],
    landTokenIds: playerStatus?.[2],
    
    // Market prices
    prices: allPrices ? {
      wheatSeed: allPrices[0],
      grapeSeed: allPrices[1],
      pumpkinSeed: allPrices[2],
      wheatCrop: allPrices[3],
      grapeCrop: allPrices[4],
      pumpkinCrop: allPrices[5],
    } : null,
    
    // Actions
    buySeed,
    plantSeed,
    harvestCrop,
    triggerRandomEvent,
    
    // Events
    eventHistory: eventHistory?.slice(-10) || [], // Last 10 events
    priceHistory: priceUpdates?.slice(-10) || [],
    
    // Refresh
    refetchStatus,
    refetchPrices,
  };
}
