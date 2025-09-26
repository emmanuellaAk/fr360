import cron from "node-cron";
import mongoose from "mongoose";
import dotenv from "dotenv";
import MarketPrice from "./models/MarketPrice.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected in worker..."))
  .catch(err => console.error(err));
// Pick some symbols we want to simulate
const SYMBOLS = ["AAPL", "TSLA", "BTC-USD"];

// Random walk function (generate next price based on last one)
const generateNextPrice = (lastPrice) => {
  const changePercent = (Math.random() - 0.5) * 0.02; // -1% to +1%
  return Math.max(1, lastPrice * (1 + changePercent));
};

// Simulate and insert prices
const simulatePrices = async () => {
  try {
    for (let symbol of SYMBOLS) {
      // Find latest price in DB
      const latest = await MarketPrice.findOne({ symbol }).sort({ timestamp: -1 });

      // If none exists, start with base
      const basePrice = latest ? latest.price : 100;

      // Generate next price
      const newPrice = generateNextPrice(basePrice);

      // Save to DB
      const priceDoc = new MarketPrice({
        symbol,
        price: newPrice,
      });
      await priceDoc.save();

      console.log(`[${new Date().toISOString()}] ${symbol}: ${newPrice.toFixed(2)}`);
    }
  } catch (err) {
    console.error("Error simulating prices:", err);
  }
};

// Schedule every 10 seconds
cron.schedule("*/10 * * * * *", simulatePrices);

console.log("📈 Price simulation worker started...");