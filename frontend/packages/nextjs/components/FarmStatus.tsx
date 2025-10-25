'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import { useScaffoldEventHistory } from '~~/hooks/scaffold-eth';
import { notification } from '~~/utils/scaffold-eth';

interface GardenState {
  owner: string;
  plantCount: number;
  totalGrowth: number;
  totalHealth: number;
  lastRoundExecuted: bigint;
  exists: boolean;
}

interface PriceData {
  tomato: bigint;
  wheat: bigint;
  corn: bigint;
  potato: bigint;
}

interface RoundResult {
  eventData: {
    eventType: number;
    severity: number;
    timestamp: number;
    seed: string;
  };
  effectResult: {
    growthDelta: number;
    healthDelta: number;
    yieldModifier: number;
    timestamp: number;
  };
  pricesUpdated: bigint;
  executedAt: bigint;
}

const EVENT_TYPES = ['NONE', 'LOCUSTS', 'WIND', 'RAIN', 'DROUGHT', 'FROST', 'SUNSTORM', 'PESTS'];
const EVENT_ICONS = ['🌾', '🦗', '💨', '🌧️', '☀️', '❄️', '🌞', '🐛'];

export default function FarmStatus() {
  const { address: connectedAddress } = useAccount();
  const [gardenId, setGardenId] = useState<number>(1);
  const [isCreatingGarden, setIsCreatingGarden] = useState(false);

  // Подключение к контрактам
  const { data: farmOrchestrator } = useScaffoldContract({
    contractName: 'FarmOrchestrator',
  });

  const { data: marketManager } = useScaffoldContract({
    contractName: 'MarketManager',
  });

  // Чтение состояния огорода
  const { data: garden, refetch: refetchGarden } = useScaffoldReadContract({
    contractName: 'FarmOrchestrator',
    functionName: 'getGarden',
    args: [BigInt(gardenId)],
  }) as { data: GardenState | undefined; refetch: () => void };

  // Чтение цен
  const { data: prices, refetch: refetchPrices } = useScaffoldReadContract({
    contractName: 'MarketManager',
    functionName: 'getAllPrices',
  }) as { data: PriceData | undefined; refetch: () => void };

  // Создание огорода
  const { writeContractAsync: createGarden } = useScaffoldWriteContract('FarmOrchestrator');

  // Слушаем события RoundExecuted
  const { data: roundEvents } = useScaffoldEventHistory({
    contractName: 'FarmOrchestrator',
    eventName: 'RoundExecuted',
    fromBlock: 0n,
    filters: { gardenId: BigInt(gardenId) },
    watch: true,
  });

  // Обновляем данные при новых событиях
  useEffect(() => {
    if (roundEvents && roundEvents.length > 0) {
      refetchGarden();
      refetchPrices();
      
      const latestEvent = roundEvents[roundEvents.length - 1];
      notification.success(`🎲 Round ${latestEvent.args.roundId?.toString()} completed!`);
    }
  }, [roundEvents, refetchGarden, refetchPrices]);

  const handleCreateGarden = async () => {
    if (!connectedAddress) {
      notification.error('Please connect your wallet');
      return;
    }

    setIsCreatingGarden(true);
    try {
      await createGarden({
        functionName: 'createGarden',
        args: [],
      });
      
      notification.success('🌱 Garden created successfully!');
      // Предполагаем что это первый огород пользователя
      setGardenId(1);
      setTimeout(() => refetchGarden(), 2000);
    } catch (error: any) {
      notification.error(`Failed to create garden: ${error.message}`);
    } finally {
      setIsCreatingGarden(false);
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 800) return 'text-success';
    if (health >= 500) return 'text-warning';
    return 'text-error';
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 800) return 'text-success';
    if (growth >= 500) return 'text-warning';
    return 'text-error';
  };

  if (!connectedAddress) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">🌾 Farm Status</h2>
          <p>Please connect your wallet to view your farm</p>
        </div>
      </div>
    );
  }

  if (!garden?.exists) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">🌾 Create Your Farm</h2>
          <p className="mb-4">You don't have a garden yet. Create one to start farming!</p>
          <button
            className="btn btn-primary"
            onClick={handleCreateGarden}
            disabled={isCreatingGarden}
          >
            {isCreatingGarden ? (
              <>
                <span className="loading loading-spinner"></span>
                Creating...
              </>
            ) : (
              '🌱 Create Garden'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Garden Status Card */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            🌾 Garden #{gardenId}
            <div className="badge badge-primary">Active</div>
          </h2>

          <div className="stats stats-vertical lg:stats-horizontal shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">Health</div>
              <div className={`stat-value ${getHealthColor(garden.totalHealth)}`}>
                {(garden.totalHealth / 10).toFixed(1)}%
              </div>
              <div className="stat-desc">Keep plants healthy!</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">Growth</div>
              <div className={`stat-value ${getGrowthColor(garden.totalGrowth)}`}>
                {(garden.totalGrowth / 10).toFixed(1)}%
              </div>
              <div className="stat-desc">Plants growing</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-accent">🌱</div>
              <div className="stat-title">Plants</div>
              <div className="stat-value">{garden.plantCount}</div>
              <div className="stat-desc">Total count</div>
            </div>

            <div className="stat">
              <div className="stat-figure">⏱️</div>
              <div className="stat-title">Last Round</div>
              <div className="stat-value text-sm">{garden.lastRoundExecuted.toString()}</div>
              <div className="stat-desc">Round ID</div>
            </div>
          </div>

          {/* Progress bars */}
          <div className="space-y-2 mt-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Health</span>
                <span>{(garden.totalHealth / 10).toFixed(1)}%</span>
              </div>
              <progress
                className={`progress ${garden.totalHealth >= 800 ? 'progress-success' : garden.totalHealth >= 500 ? 'progress-warning' : 'progress-error'} w-full`}
                value={garden.totalHealth}
                max="1000"
              ></progress>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Growth</span>
                <span>{(garden.totalGrowth / 10).toFixed(1)}%</span>
              </div>
              <progress
                className={`progress ${garden.totalGrowth >= 800 ? 'progress-success' : garden.totalGrowth >= 500 ? 'progress-warning' : 'progress-error'} w-full`}
                value={garden.totalGrowth}
                max="1000"
              ></progress>
            </div>
          </div>
        </div>
      </div>

      {/* Market Prices Card */}
      {prices && (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">💰 Market Prices</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat bg-base-300 rounded-box">
                <div className="stat-figure">🍅</div>
                <div className="stat-title">Tomato</div>
                <div className="stat-value text-sm">
                  {(Number(prices.tomato) / 1e18).toFixed(4)} ETH
                </div>
              </div>
              <div className="stat bg-base-300 rounded-box">
                <div className="stat-figure">🌾</div>
                <div className="stat-title">Wheat</div>
                <div className="stat-value text-sm">
                  {(Number(prices.wheat) / 1e18).toFixed(4)} ETH
                </div>
              </div>
              <div className="stat bg-base-300 rounded-box">
                <div className="stat-figure">🌽</div>
                <div className="stat-title">Corn</div>
                <div className="stat-value text-sm">
                  {(Number(prices.corn) / 1e18).toFixed(4)} ETH
                </div>
              </div>
              <div className="stat bg-base-300 rounded-box">
                <div className="stat-figure">🥔</div>
                <div className="stat-title">Potato</div>
                <div className="stat-value text-sm">
                  {(Number(prices.potato) / 1e18).toFixed(4)} ETH
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Events */}
      {roundEvents && roundEvents.length > 0 && (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">📅 Recent Events</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Round</th>
                    <th>Event</th>
                    <th>Block</th>
                  </tr>
                </thead>
                <tbody>
                  {roundEvents.slice(-5).reverse().map((event, idx) => (
                    <tr key={idx}>
                      <td>{event.args.roundId?.toString()}</td>
                      <td>
                        <span className="badge badge-primary">Round Executed</span>
                      </td>
                      <td>{event.blockNumber?.toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
