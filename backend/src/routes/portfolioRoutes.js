import express from "express";
import Portfolio from "../models/Portfolio.js";
import { protect } from "../middleware/auth.js";
import { getLatestPrice } from "../services/marketService.js";
import { getEnrichedPortfolio, getPortfolioPositions } from "../services/dataPrep.js";
import Position from "../models/Position.js";
import VaRRun from "../models/VaRRun.js";
import { computeParametricVaR } from "../services/varService.js";
import { varQueue } from "../queues/varQueue.js";

const router = express.Router();

// Create portfolio
router.post("/", protect, async (req, res) => {
    try {
        const portfolio = new Portfolio({ ...req.body, user: req.user._id });
        const saved = await portfolio.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("Error creating portfolio:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/", protect, async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ user: req.user._id });

        const enriched = await Promise.all(
            portfolios.map(async (p) => {
                // get positions for this portfolio
                const positions = await Position.find({ portfolio: p._id });

                let totalValue = 0;
                for (let pos of positions) {
                    const latestPrice = await getLatestPrice(pos.symbol);
                    if (latestPrice) {
                        totalValue += pos.quantity * latestPrice;
                    }
                }

                return {
                    _id: p._id,
                    name: p.name,
                    baseCurrency: p.baseCurrency,
                    totalValue,
                };
            })
        );

        res.json(enriched);
    } catch (err) {
        console.error("Error fetching enriched portfolios:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get single portfolio
router.get("/:id", protect, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
        if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });
        res.json(portfolio);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update portfolio
router.put("/:id", protect, async (req, res) => {
    try {
        const updated = await Portfolio.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Portfolio not found" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete portfolio
router.delete("/:id", protect, async (req, res) => {
    try {
        const deleted = await Portfolio.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!deleted) return res.status(404).json({ message: "Portfolio not found" });
        await Position.deleteMany({ portfolio: deleted._id });
        res.json({ message: "Portfolio and positions deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:id/summary", protect, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
        if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

        const { positions, totalInvested } = await getPortfolioPositions(portfolio._id);

        const summary = {
            portfolio: portfolio.name,
            baseCurrency: portfolio.baseCurrency,
            totalPositions: positions.length,
            totalInvested,
        };

        res.json(summary);
    } catch (err) {
        console.error("Error fetching portfolio summary:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get portfolio valuation
router.get("/:id/value", protect, async (req, res) => {
    try {
        const snapshot = await getEnrichedPortfolio(req.params.id, req.user._id);
        res.json(snapshot);
    } catch (err) {
        console.error("Error calculating portfolio value:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// router.post("/:id/var", protect, async (req, res) => {
//     try {
//         const { method, confidence, horizonDays } = req.body;
//         if (method !== "parametric") {
//             return res.status(400).json({ message: "Only parametric supported right now" });
//         }

//         const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
//         if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

//         const positions = await Position.find({ portfolio: portfolio._id });
//         if (positions.length === 0) return res.status(400).json({ message: "No positions in portfolio" });

//         const result = await computeParametricVaR(positions, confidence, horizonDays);

//         // store VaRRun
//         const run = new VaRRun({
//             portfolio: portfolio._id,
//             user: req.user._id,
//             method,
//             params: { confidence, horizonDays },
//             result
//         });
//         await run.save();

//         res.json(run);
//     } catch (err) {
//         console.error("Error running VaR:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

export default router;
