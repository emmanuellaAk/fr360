import express from "express";
import Portfolio from "../models/Portfolio.js";
import Position from "../models/Position.js";
import VaRRun from "../models/VaRRun.js";
import { computeParametricVaR } from "../services/varService.js";
import { protect } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true }); // mergeParams is key

// POST /api/portfolios/:portfolioId/var
router.post("/", protect, async (req, res) => {
    try {
        const { method, confidence, horizonDays } = req.body;
        if (method !== "parametric") {
            return res.status(400).json({ message: "Only parametric supported right now" });
        }

        const portfolio = await Portfolio.findOne({ _id: req.params.portfolioId, user: req.user._id });
        if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

        const positions = await Position.find({ portfolio: portfolio._id });
        if (positions.length === 0) return res.status(400).json({ message: "No positions in portfolio" });

        const result = await computeParametricVaR(positions, confidence, horizonDays);

        const run = new VaRRun({
            portfolio: portfolio._id,
            user: req.user._id,
            method,
            params: { confidence, horizonDays },
            result
        });
        await run.save();

        res.status(201).json(run);
    } catch (err) {
        console.error("Error running VaR:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/portfolios/:portfolioId/var/:runId
router.get("/:runId", protect, async (req, res) => {
    try {
        const run = await VaRRun.findOne({ _id: req.params.runId, user: req.user._id })
            .populate("portfolio", "name baseCurrency");

        if (!run) return res.status(404).json({ message: "VaR run not found" });

        res.json(run);
    } catch (err) {
        console.error("Error fetching VaR run:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;