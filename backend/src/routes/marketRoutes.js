import express from "express";
import MarketPrice from "../models/MarketPrice.js";
import { protect } from "../middleware/auth.js";
import { createClient } from "redis";

const router = express.Router();

// Add a new price (simulate or manual insert)
// router.post("/", protect, async (req, res) => {
//     try {
//         const { symbol, price } = req.body;
//         if (!symbol || !price) {
//             return res.status(400).json({ message: "Symbol and price are required" });
//         }

//         const newPrice = new MarketPrice({ symbol: symbol.toUpperCase(), price });
//         const saved = await newPrice.save();
//         res.status(201).json(saved);
//     } catch (err) {
//         console.error("Error inserting market price:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

// router.post("/simulate", protect, async (req, res) => {
//     try {
//         const symbols = req.body.symbols || ["AAPL", "TSLA", "BTC-USD", "ETH-USD"];
//         const generated = [];

//         for (let symbol of symbols) {
//             const randomPrice = (Math.random() * 1000).toFixed(2); // fake random price
//             const priceEntry = new MarketPrice({
//                 symbol: symbol.toUpperCase(),
//                 price: randomPrice
//             });
//             const saved = await priceEntry.save();
//             generated.push(saved);
//         }

//         res.status(201).json({
//             message: "Simulated prices inserted successfully",
//             data: generated
//         });
//     } catch (err) {
//         console.error("Error simulating prices:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });


// // Get latest price of a symbol
// router.get("/latest/:symbol", protect, async (req, res) => {
//     try {
//         const price = await MarketPrice.findOne({ symbol: req.params.symbol.toUpperCase() })
//             .sort({ timestamp: -1 });

//         if (!price) return res.status(404).json({ message: "No price data found" });

//         res.json(price);
//     } catch (err) {
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

// // Get historical prices
// router.get("/history/:symbol", protect, async (req, res) => {
//     try {
//         const { from, to } = req.query;
//         const query = { symbol: req.params.symbol.toUpperCase() };

//         if (from || to) {
//             query.timestamp = {};
//             if (from) query.timestamp.$gte = new Date(from);
//             if (to) query.timestamp.$lte = new Date(to);
//         }

//         const history = await MarketPrice.find(query).sort({ timestamp: 1 });
//         res.json(history);
//     } catch (err) {
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

router.post("/", protect, async (req, res) => {
    try {
        const { symbol, price } = req.body;
        if (!symbol || !price) return res.status(400).json({ message: "Symbol and price required" });

        const entry = new MarketPrice({ symbol: symbol.toUpperCase(), price });
        const saved = await entry.save();

        // Update Redis cache too
        await redis.set(symbol.toUpperCase(), price.toFixed(2));

        res.status(201).json(saved);
    } catch (err) {
        console.error("Error inserting market price:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get latest price (Redis → Mongo fallback)
router.get("/latest/:symbol", protect, async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();

        // Try cache first
        const cachedPrice = await redis.get(symbol);
        if (cachedPrice) {
            return res.json({
                symbol,
                price: parseFloat(cachedPrice),
                source: "cache"
            });
        }

        // Fallback: MongoDB
        const priceDoc = await MarketPrice.findOne({ symbol }).sort({ timestamp: -1 });
        if (!priceDoc) return res.status(404).json({ message: "No price data found" });

        res.json({ ...priceDoc.toObject(), source: "database" });
    } catch (err) {
        console.error("Error fetching latest price:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get historical prices
router.get("/history/:symbol", protect, async (req, res) => {
    try {
        const { from, to } = req.query;
        const query = { symbol: req.params.symbol.toUpperCase() };

        if (from || to) {
            query.timestamp = {};
            if (from) query.timestamp.$gte = new Date(from);
            if (to) query.timestamp.$lte = new Date(to);
        }

        const history = await MarketPrice.find(query).sort({ timestamp: 1 });
        res.json(history);
    } catch (err) {
        console.error("Error fetching history:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router;