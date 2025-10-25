import { expect } from "chai";
import { ethers } from "hardhat";
import { TimeBasedOracle, PersonalizedShop, HourlyEvents } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("🌾 Time-Based Farm System", function () {
  let oracle: TimeBasedOracle;
  let shop: PersonalizedShop;
  let events: HourlyEvents;
  let deployer: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  before(async function () {
    [deployer, player1, player2] = await ethers.getSigners();

    // Deploy contracts
    const TimeBasedOracle = await ethers.getContractFactory("TimeBasedOracle");
    oracle = await TimeBasedOracle.deploy();
    await oracle.waitForDeployment();

    const PersonalizedShop = await ethers.getContractFactory("PersonalizedShop");
    shop = await PersonalizedShop.deploy(await oracle.getAddress());
    await shop.waitForDeployment();

    const HourlyEvents = await ethers.getContractFactory("HourlyEvents");
    events = await HourlyEvents.deploy(await oracle.getAddress());
    await events.waitForDeployment();

    console.log("\n📦 Deployed contracts:");
    console.log("  TimeBasedOracle:", await oracle.getAddress());
    console.log("  PersonalizedShop:", await shop.getAddress());
    console.log("  HourlyEvents:", await events.getAddress());
  });

  describe("⏰ Time-Based Oracle", function () {
    it("Should generate daily hash", async function () {
      const dailyHash = await oracle.getDailyHash();
      expect(dailyHash).to.not.equal(ethers.ZeroHash);
      console.log("\n📅 Daily Hash:", dailyHash.slice(0, 10) + "...");
    });

    it("Should generate hourly hash", async function () {
      const hourlyHash = await oracle.getHourlyHash();
      expect(hourlyHash).to.not.equal(ethers.ZeroHash);
      console.log("🕐 Hourly Hash:", hourlyHash.slice(0, 10) + "...");
    });

    it("Should generate unique player hash", async function () {
      const dailyHash = await oracle.getDailyHash();
      const player1Hash = await oracle.getPlayerDailyHash(player1.address, dailyHash);
      const player2Hash = await oracle.getPlayerDailyHash(player2.address, dailyHash);
      
      expect(player1Hash).to.not.equal(player2Hash);
      console.log("👤 Player 1 Hash:", player1Hash.slice(0, 10) + "...");
      console.log("👤 Player 2 Hash:", player2Hash.slice(0, 10) + "...");
    });
  });

  describe("🏪 Personalized Shop", function () {
    it("Should generate different shops for different players", async function () {
      const priceMultipliers: [bigint, bigint, bigint, bigint] = [1000n, 1000n, 1000n, 1000n]; // Normal prices

      const shop1 = await shop.getPlayerShop(player1.address, priceMultipliers);
      const shop2 = await shop.getPlayerShop(player2.address, priceMultipliers);

      console.log("\n🛒 Player 1 Shop:");
      console.log("  🌾 Wheat:", shop1.wheatQuantity.toString(), "seeds @ ", ethers.formatEther(shop1.wheatPrice), "ETH");
      console.log("  🍇 Grape:", shop1.grapeQuantity.toString(), "seeds @ ", ethers.formatEther(shop1.grapePrice), "ETH");
      console.log("  🎃 Pumpkin:", shop1.pumpkinQuantity.toString(), "seeds @ ", ethers.formatEther(shop1.pumpkinPrice), "ETH");
      console.log("  🌽 Corn:", shop1.cornQuantity.toString(), "seeds @ ", ethers.formatEther(shop1.cornPrice), "ETH");

      console.log("\n🛒 Player 2 Shop:");
      console.log("  🌾 Wheat:", shop2.wheatQuantity.toString(), "seeds @ ", ethers.formatEther(shop2.wheatPrice), "ETH");
      console.log("  🍇 Grape:", shop2.grapeQuantity.toString(), "seeds @ ", ethers.formatEther(shop2.grapePrice), "ETH");
      console.log("  🎃 Pumpkin:", shop2.pumpkinQuantity.toString(), "seeds @ ", ethers.formatEther(shop2.pumpkinPrice), "ETH");
      console.log("  🌽 Corn:", shop2.cornQuantity.toString(), "seeds @ ", ethers.formatEther(shop2.cornPrice), "ETH");

      // Verify shops are different
      const shop1Total = shop1.wheatQuantity + shop1.grapeQuantity + shop1.pumpkinQuantity + shop1.cornQuantity;
      const shop2Total = shop2.wheatQuantity + shop2.grapeQuantity + shop2.pumpkinQuantity + shop2.cornQuantity;
      
      expect(shop1Total).to.not.equal(shop2Total);
      console.log("\n✅ Shops are personalized!");
    });

    it("Should apply price multipliers", async function () {
      const normalPrices: [bigint, bigint, bigint, bigint] = [1000n, 1000n, 1000n, 1000n];
      const surgePrices: [bigint, bigint, bigint, bigint] = [1150n, 1000n, 1000n, 1000n]; // Wheat +15%

      const shop1 = await shop.getPlayerShop(player1.address, normalPrices);
      const shop2 = await shop.getPlayerShop(player1.address, surgePrices);

      console.log("\n💰 Price Surge Effect:");
      console.log("  Normal Wheat:", ethers.formatEther(shop1.wheatPrice), "ETH");
      console.log("  Surge Wheat:", ethers.formatEther(shop2.wheatPrice), "ETH");

      expect(shop2.wheatPrice).to.be.greaterThan(shop1.wheatPrice);
      console.log("✅ Price multiplier works!");
    });
  });

  describe("⚡ Hourly Events", function () {
    it("Should generate current event", async function () {
      const currentEvent = await events.getCurrentEvent();
      const eventNames = ["NONE", "RAIN", "LOCUSTS", "PRICE_SURGE", "DROUGHT", "BLESSING"];
      const eventEmojis = ["❌", "🌧️", "🦗", "📈", "☀️", "✨"];
      const eventIndex = Number(currentEvent.eventType);

      console.log("\n🎲 Current Event:", eventEmojis[eventIndex], eventNames[eventIndex]);
      
      if (currentEvent.eventType === 1n) { // RAIN
        console.log("  Effect: Growth speed 2x faster! 🚀");
      } else if (currentEvent.eventType === 2n) { // LOCUSTS
        console.log("  Effect: 50% chance to eat 10-50% of crops! 💀");
      } else if (currentEvent.eventType === 3n) { // PRICE_SURGE
        console.log("  Effect: One crop price +15%! 💰");
      } else if (currentEvent.eventType === 4n) { // DROUGHT
        console.log("  Effect: Growth speed 2x slower! 🐌");
      } else if (currentEvent.eventType === 5n) { // BLESSING
        console.log("  Effect: Growth speed 2x faster! ✨");
      }

      expect(currentEvent.eventType).to.be.lessThan(6);
    });

    it("Should check if LOCUSTS affects player", async function () {
      const currentEvent = await events.getCurrentEvent();
      
      if (currentEvent.eventType === 2n) { // LOCUSTS
        const affected1 = await events.doesEventAffectPlayer(player1.address);
        const affected2 = await events.doesEventAffectPlayer(player2.address);
        
        console.log("\n🦗 Locust Attack:");
        console.log("  Player 1 affected:", affected1 ? "YES 💀" : "NO ✅");
        console.log("  Player 2 affected:", affected2 ? "YES 💀" : "NO ✅");
      } else {
        console.log("\n🦗 No locust attack this hour");
      }
    });

    it("Should return growth multiplier", async function () {
      const multiplier = await events.getGrowthMultiplier();
      const multiplierPercent = Number(multiplier) / 10;
      
      console.log("\n📊 Growth Multiplier:", multiplierPercent + "%");
      
      if (multiplier === 2000n) {
        console.log("  🚀 Crops grow 2x faster!");
      } else if (multiplier === 500n) {
        console.log("  🐌 Crops grow 2x slower!");
      } else {
        console.log("  ➡️ Normal growth speed");
      }

      expect(multiplier).to.be.oneOf([500n, 1000n, 2000n]);
    });

    it("Should return price multipliers", async function () {
      const multipliers = await events.getPriceMultipliers();
      
      console.log("\n💰 Price Multipliers:");
      console.log("  🌾 Wheat:", Number(multipliers[0]) / 10 + "%");
      console.log("  🍇 Grape:", Number(multipliers[1]) / 10 + "%");
      console.log("  🎃 Pumpkin:", Number(multipliers[2]) / 10 + "%");
      console.log("  🌽 Corn:", Number(multipliers[3]) / 10 + "%");

      // Check if any price has surge
      const hasSurge = multipliers.some((m: bigint) => m > 1000n);
      if (hasSurge) {
        console.log("  📈 PRICE SURGE ACTIVE!");
      }
    });
  });

  describe("🎮 Game Scenarios", function () {
    it("Scenario: Player checks shop during RAIN event", async function () {
      console.log("\n" + "=".repeat(60));
      console.log("📖 SCENARIO: Rain Event Shopping");
      console.log("=".repeat(60));

      const currentEvent = await events.getCurrentEvent();
      const eventNames = ["NONE", "RAIN", "LOCUSTS", "PRICE_SURGE", "DROUGHT", "BLESSING"];
      const eventIndex = Number(currentEvent.eventType);

      console.log("⏰ Current time: Hour", Math.floor(Date.now() / 3600000) % 24);
      console.log("🎲 Active event:", eventNames[eventIndex]);

      const multipliers = await events.getPriceMultipliers();
      const multipliersArray: [bigint, bigint, bigint, bigint] = [
        multipliers[0],
        multipliers[1],
        multipliers[2],
        multipliers[3]
      ];
      const playerShop = await shop.getPlayerShop(player1.address, multipliersArray);

      console.log("\n🏪 Your Personal Shop:");
      console.log("  🌾 Wheat:", playerShop.wheatQuantity.toString(), "x", ethers.formatEther(playerShop.wheatPrice), "ETH");
      console.log("  🍇 Grape:", playerShop.grapeQuantity.toString(), "x", ethers.formatEther(playerShop.grapePrice), "ETH");
      console.log("  🎃 Pumpkin:", playerShop.pumpkinQuantity.toString(), "x", ethers.formatEther(playerShop.pumpkinPrice), "ETH");
      console.log("  🌽 Corn:", playerShop.cornQuantity.toString(), "x", ethers.formatEther(playerShop.cornPrice), "ETH");

      const growthMultiplier = await events.getGrowthMultiplier();
      if (growthMultiplier === 2000n) {
        console.log("\n🌧️ RAIN ACTIVE: Seeds grow 2x faster! Good time to plant!");
      } else if (growthMultiplier === 500n) {
        console.log("\n☀️ DROUGHT: Seeds grow 2x slower. Consider waiting.");
      }

      console.log("=".repeat(60) + "\n");
    });
  });
});
