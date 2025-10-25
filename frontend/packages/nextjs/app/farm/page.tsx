import FarmStatus from "~~/components/FarmStatus";
import type { NextPage } from "next";

const FarmPage: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-7xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold mb-2">🌾 Farm Game</span>
            <span className="block text-2xl">Blockchain-Based Farming Simulator</span>
          </h1>

          <div className="flex flex-col gap-4 mb-8">
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <h3 className="font-bold">How it works</h3>
                <div className="text-xs">
                  Every 20 seconds, a Keeper bot executes a round for your garden. Random events affect your plants'
                  health and growth, which impacts market prices!
                </div>
              </div>
            </div>
          </div>

          <FarmStatus />

          <div className="mt-8 mb-12">
            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">📖 Game Mechanics</div>
              <div className="collapse-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">🎲 Events (8 types):</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>🌾 NONE (30%) - Nothing happens</li>
                      <li>🦗 LOCUSTS (15%) - Damage crops</li>
                      <li>💨 WIND (10%) - Minor damage</li>
                      <li>🌧️ RAIN (20%) - Good for growth</li>
                      <li>☀️ DROUGHT (10%) - Reduces health</li>
                      <li>❄️ FROST (5%) - Heavy damage</li>
                      <li>🌞 SUNSTORM (5%) - Boosts growth</li>
                      <li>🐛 PESTS (5%) - Moderate damage</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">💰 Market Dynamics:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Prices change based on yield</li>
                      <li>Bad events → lower yield → higher prices</li>
                      <li>Good events → higher yield → lower prices</li>
                      <li>Range: 50% - 200% of base price</li>
                    </ul>
                    <h4 className="font-bold mb-2 mt-4">⏱️ Automation:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Rounds execute every 20 seconds</li>
                      <li>Keeper bot with KEEPER_ROLE</li>
                      <li>On-chain commit-reveal RNG</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmPage;
