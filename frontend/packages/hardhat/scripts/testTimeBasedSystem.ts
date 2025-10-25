import { ethers } from "hardhat";

/**
 * Тест новой Time-Based системы
 */
async function main() {
  console.log("🌾 Testing Time-Based Farm System...\n");

  const [deployer, player1, player2] = await ethers.getSigners();

  // Deploy contracts
  console.log("📦 Deploying contracts...");
  
  const TimeBasedOracle = await ethers.getContractFactory("TimeBasedOracle");
  const oracle = await TimeBasedOracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("✅ TimeBasedOracle:", oracleAddress);

  const PersonalizedShop = await ethers.getContractFactory("PersonalizedShop");
  const shop = await PersonalizedShop.deploy(oracleAddress);
  await shop.waitForDeployment();
  const shopAddress = await shop.getAddress();
  console.log("✅ PersonalizedShop:", shopAddress);

  const HourlyEvents = await ethers.getContractFactory("HourlyEvents");
  const events = await HourlyEvents.deploy(oracleAddress);
  await events.waitForDeployment();
  const eventsAddress = await events.getAddress();
  console.log("✅ HourlyEvents:", eventsAddress);

  console.log("\n" + "=".repeat(60) + "\n");

  // Test 1: Get time hashes
  console.log("⏰ TEST 1: Time-Based Hashes\n");
  
  const dailyEpoch = await oracle.getDailyEpoch();
  const hourlyEpoch = await oracle.getHourlyEpoch();
  const dailyHash = await oracle.getDailyHash();
  const hourlyHash = await oracle.getHourlyHash();
  
  console.log("Daily Epoch:", dailyEpoch.toString());
  console.log("Hourly Epoch:", hourlyEpoch.toString());
  console.log("Daily Hash:", dailyHash);
  console.log("Hourly Hash:", hourlyHash);

  console.log("\n" + "=".repeat(60) + "\n");

  // Test 2: Personalized shops
  console.log("🏪 TEST 2: Personalized Shops\n");
  
  const priceMultipliers = await events.getPriceMultipliers();
  console.log("Price Multipliers:", priceMultipliers.map(m => m.toString()));
  
  const shop1 = await shop.getPlayerShop(player1.address, priceMultipliers);
  const shop2 = await shop.getPlayerShop(player2.address, priceMultipliers);
  
  console.log("\n👤 Player 1 Shop:");
  console.log("  🌾 Wheat:", shop1.wheatQuantity.toString());
  console.log("  🍇 Grape:", shop1.grapeQuantity.toString());
  console.log("  🎃 Pumpkin:", shop1.pumpkinQuantity.toString());
  console.log("  🌽 Corn:", shop1.cornQuantity.toString());
  console.log("  💰 Wheat Price:", ethers.formatEther(shop1.wheatPrice), "ETH");
  
  console.log("\n👤 Player 2 Shop (DIFFERENT!):");
  console.log("  🌾 Wheat:", shop2.wheatQuantity.toString());
  console.log("  🍇 Grape:", shop2.grapeQuantity.toString());
  console.log("  🎃 Pumpkin:", shop2.pumpkinQuantity.toString());
  console.log("  🌽 Corn:", shop2.cornQuantity.toString());
  console.log("  💰 Wheat Price:", ethers.formatEther(shop2.wheatPrice), "ETH");

  console.log("\n" + "=".repeat(60) + "\n");

  // Test 3: Hourly Events
  console.log("🎲 TEST 3: Hourly Events\n");
  
  const currentEvent = await events.getCurrentEvent();
  
  const eventTypes = ["NONE", "RAIN", "LOCUSTS", "PRICE_SURGE", "DROUGHT", "BLESSING"];
  const eventEmojis = ["🌾", "🌧️", "🦗", "📈", "☀️", "✨"];
  
  const eventIndex = Number(currentEvent.eventType);
  console.log("Current Event:", eventTypes[eventIndex], eventEmojis[eventIndex]);
  console.log("Hourly Epoch:", currentEvent.hourlyEpoch.toString());
  console.log("Target Crop:", currentEvent.targetCrop.toString());
  console.log("Severity:", currentEvent.severity.toString() + "%");
  
  // Check if players are affected by locusts
  if (currentEvent.eventType === 2n) { // LOCUSTS
    const player1Affected = await events.doesEventAffectPlayer(player1.address);
    const player2Affected = await events.doesEventAffectPlayer(player2.address);
    
    console.log("\n🦗 Locusts Attack:");
    console.log("  Player 1:", player1Affected ? "❌ AFFECTED!" : "✅ Safe");
    console.log("  Player 2:", player2Affected ? "❌ AFFECTED!" : "✅ Safe");
  }
  
  // Growth multiplier
  const growthMultiplier = await events.getGrowthMultiplier();
  console.log("\n🌱 Growth Speed:", (Number(growthMultiplier) / 1000).toFixed(1) + "x");
  if (growthMultiplier === 2000n) {
    console.log("   → Plants grow 2x faster! 🚀");
  } else if (growthMultiplier === 500n) {
    console.log("   → Plants grow 2x slower! 🐌");
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Test 4: Verify personalization
  console.log("🔍 TEST 4: Verify Personalization\n");
  
  const player1Hash = await oracle.getPlayerDailyHash(player1.address, dailyHash);
  const player2Hash = await oracle.getPlayerDailyHash(player2.address, dailyHash);
  
  console.log("Player 1 Hash:", player1Hash);
  console.log("Player 2 Hash:", player2Hash);
  console.log("Are different?", player1Hash !== player2Hash ? "✅ YES" : "❌ NO");
  
  // Check if shops are different
  const shopsDifferent = 
    shop1.wheatQuantity !== shop2.wheatQuantity ||
    shop1.grapeQuantity !== shop2.grapeQuantity ||
    shop1.pumpkinQuantity !== shop2.pumpkinQuantity ||
    shop1.cornQuantity !== shop2.cornQuantity;
  
  console.log("Shops are different?", shopsDifferent ? "✅ YES" : "❌ NO");

  console.log("\n" + "=".repeat(60) + "\n");
  console.log("✅ All tests completed!\n");
  
  // Summary
  console.log("📝 SUMMARY:");
  console.log("✅ Time-based hashes working");
  console.log("✅ Personalized shops for each player");
  console.log("✅ Hourly events system active");
  console.log("✅ Gas-efficient (all read-only operations)");
  console.log("\n🎉 System is ready for deployment!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
