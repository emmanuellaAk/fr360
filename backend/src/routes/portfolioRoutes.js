import express from "express";
import Portfolio from "../models/Portfolio.js";
import { protect } from "../middleware/auth.js";
import Position from "../models/Position.js";

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

// Get all portfolios of user
router.get("/", protect, async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(portfolios);
    } catch (err) {
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

// Get portfolio summary like total positions, total invested amount)
router.get("/:id/summary", protect, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
        if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

        const positions = await Position.find({ portfolio: portfolio._id });

        const summary = {
            totalPositions: positions.length,
            totalInvested: positions.reduce((sum, p) => sum + (p.quantity * p.avgPrice), 0)
        };

        res.json({ portfolio: portfolio.name, baseCurrency: portfolio.baseCurrency, ...summary });
    } catch (err) {
        console.error("Error fetching portfolio summary:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
