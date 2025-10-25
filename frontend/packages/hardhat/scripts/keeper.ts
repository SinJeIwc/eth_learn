/**
 * Farm Game Keeper Script
 * 
 * Автоматически выполняет раунды для всех активных огородов каждые 20 секунд
 * Использует commit-reveal схему для генерации случайных событий
 */

import { ethers } from "hardhat";
import { FarmOrchestrator } from "../typechain-types";

const ROUND_INTERVAL = 20; // секунды
const MAX_GARDENS = 100; // максимальное количество огородов для обработки

async function main() {
  console.log("🌾 Starting Farm Game Keeper...\n");

  // Получаем deployer аккаунт (должен иметь KEEPER_ROLE)
  const [keeper] = await ethers.getSigners();
  console.log(`Keeper address: ${keeper.address}\n`);

  // Подключаемся к deployed контракту
  // ВАЖНО: замените на актуальный адрес после деплоя
  const orchestratorAddress = process.env.FARM_ORCHESTRATOR_ADDRESS || "";
  
  if (!orchestratorAddress) {
    console.error("❌ Error: FARM_ORCHESTRATOR_ADDRESS not set in environment");
    console.log("Please set it in .env file or run with:");
    console.log("FARM_ORCHESTRATOR_ADDRESS=0x... yarn keeper");
    process.exit(1);
  }

  const farmOrchestrator = await ethers.getContractAt(
    "FarmOrchestrator",
    orchestratorAddress
  ) as FarmOrchestrator;

  console.log(`Connected to FarmOrchestrator at: ${orchestratorAddress}\n`);

  // Проверяем роль
  const KEEPER_ROLE = await farmOrchestrator.KEEPER_ROLE();
  const hasRole = await farmOrchestrator.hasRole(KEEPER_ROLE, keeper.address);
  
  if (!hasRole) {
    console.error("❌ Error: Current account does not have KEEPER_ROLE");
    process.exit(1);
  }

  console.log("✅ Keeper role verified\n");
  console.log(`⏰ Round interval: ${ROUND_INTERVAL} seconds\n`);
  console.log("Starting keeper loop... Press Ctrl+C to stop\n");

  // Главный цикл
  let roundCounter = 0;
  
  while (true) {
    try {
      roundCounter++;
      const timestamp = Math.floor(Date.now() / 1000);
      const roundId = timestamp;

      console.log(`\n🔄 Round ${roundCounter} (ID: ${roundId}) - ${new Date().toLocaleTimeString()}`);
      console.log("═".repeat(60));

      // Получаем количество огородов
      const gardenCount = await farmOrchestrator.gardenCounter();
      console.log(`📊 Total gardens: ${gardenCount}`);

      if (gardenCount === 0n) {
        console.log("⚠️  No gardens to process yet");
      } else {
        // Обрабатываем каждый огород
        const gardensToProcess = Math.min(Number(gardenCount), MAX_GARDENS);
        
        for (let i = 1; i <= gardensToProcess; i++) {
          try {
            await processGarden(farmOrchestrator, i, roundId);
          } catch (error: any) {
            console.error(`❌ Error processing garden ${i}:`, error.message);
          }
        }
      }

      console.log("\n✅ Round completed");
      console.log(`⏳ Waiting ${ROUND_INTERVAL} seconds until next round...\n`);

      // Ждем следующий раунд
      await sleep(ROUND_INTERVAL * 1000);

    } catch (error: any) {
      console.error("\n❌ Keeper error:", error.message);
      console.log("Retrying in 5 seconds...\n");
      await sleep(5000);
    }
  }
}

/**
 * Обрабатывает один огород: commit -> reveal -> execute
 */
async function processGarden(
  orchestrator: FarmOrchestrator,
  gardenId: number,
  roundId: number
) {
  console.log(`\n  🌱 Processing Garden #${gardenId}...`);

  try {
    // Проверяем, существует ли огород
    const garden = await orchestrator.getGarden(gardenId);
    if (!garden.exists) {
      console.log(`  ⚠️  Garden #${gardenId} does not exist`);
      return;
    }

    // Проверяем, не был ли уже выполнен этот раунд
    const isExecuted = await orchestrator.isRoundExecuted(gardenId, roundId);
    if (isExecuted) {
      console.log(`  ⏭️  Round already executed for garden #${gardenId}`);
      return;
    }

    // 1. Генерируем случайный seed
    const revealSeed = ethers.hexlify(ethers.randomBytes(32));
    const seedHash = ethers.keccak256(revealSeed);

    console.log(`  🔐 Committing round...`);
    
    // 2. Commit
    const commitTx = await orchestrator.commitRound(gardenId, roundId, seedHash);
    await commitTx.wait();
    console.log(`  ✅ Round committed (tx: ${commitTx.hash.slice(0, 10)}...)`);

    // 3. Execute (reveal)
    console.log(`  🎲 Executing round...`);
    const executeTx = await orchestrator.executeRound(gardenId, roundId, revealSeed);
    const receipt = await executeTx.wait();
    
    // Парсим события
    const events = receipt?.logs || [];
    console.log(`  ✅ Round executed (tx: ${executeTx.hash.slice(0, 10)}...)`);

    // Получаем результаты
    const result = await orchestrator.getRoundResult(gardenId, roundId);
    const updatedGarden = await orchestrator.getGarden(gardenId);

    // Логируем результаты
    const eventTypes = ["NONE", "LOCUSTS", "WIND", "RAIN", "DROUGHT", "FROST", "SUNSTORM", "PESTS"];
    const eventType = eventTypes[result.eventData.eventType] || "UNKNOWN";
    
    console.log(`     📅 Event: ${eventType} (severity: ${result.eventData.severity}/1000)`);
    console.log(`     💚 Health: ${updatedGarden.totalHealth}/1000 (Δ${result.effectResult.healthDelta})`);
    console.log(`     🌱 Growth: ${updatedGarden.totalGrowth}/1000 (Δ${result.effectResult.growthDelta})`);
    console.log(`     💰 Yield modifier: ${result.effectResult.yieldModifier/10}%`);

  } catch (error: any) {
    if (error.message.includes("Round already committed") || 
        error.message.includes("Round already executed")) {
      console.log(`  ⏭️  Round already processed`);
    } else {
      throw error;
    }
  }
}

/**
 * Утилита для sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Обработка сигналов для graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Keeper stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Keeper terminated');
  process.exit(0);
});

// Запуск
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
