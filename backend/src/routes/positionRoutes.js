import express from "express";
import Position from "../models/Position.js";
import Portfolio from "../models/Portfolio.js";
import { protect } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

//Add position to portfolio
router.post("/", protect, async (req, res) => {
    try {
        const { symbol, quantity, avgPrice, currency } = req.body;
        if (!symbol || !quantity || !avgPrice) {
            return res.status(400).json({ message: "Symbol, quantity, and avgPrice are required" });
        }
        if (quantity <= 0 || avgPrice < 0) {
            return res.status(400).json({ message: "Quantity must be > 0 and avgPrice >= 0" });
        }

        const portfolio = await Portfolio.findOne({ _id: req.params.portfolioId, user: req.user._id });
        if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });
        const position = new Position({ symbol, quantity, avgPrice, currency, portfolio: portfolio._id });
        // const position = new Position({ ...req.body, portfolio: portfolio._id });
        const saved = await position.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("Error creating position:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all positions of a portfolio
router.get("/", protect, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ _id: req.params.portfolioId, user: req.user._id });
        if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

        const positions = await Position.find({ portfolio: portfolio._id }).sort({ createdAt: -1 });
        res.json(positions);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update a position
// router.put("/:positionId", protect, async (req, res) => {
//     try {
//         const portfolio = await Portfolio.findOne({ _id: req.params.portfolioId, user: req.user._id });
//         if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

//         const updated = await Position.findOneAndUpdate(
//             { _id: req.params.positionId, portfolio: portfolio._id },
//             req.body,
//             { new: true }
//         );
//         if (!updated) return res.status(404).json({ message: "Position not found" });

//         res.json(updated);
//     } catch (err) {
//         console.error("Error updating position:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });
// Update a position
router.put("/:positionId", protect, async (req, res) => {
    try {
        const { quantity, avgPrice } = req.body;
        if (quantity !== undefined && quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be > 0" });
        }
        if (avgPrice !== undefined && avgPrice < 0) {
            return res.status(400).json({ message: "Average price cannot be negative" });
        }

        const portfolio = await Portfolio.findOne({ _id: req.params.portfolioId, user: req.user._id });
        if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

        const updated = await Position.findOneAndUpdate(
            { _id: req.params.positionId, portfolio: portfolio._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ message: "Position not found" });

        res.json(updated);
    } catch (err) {
        console.error("Error updating position:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Delete a position
router.delete("/:positionId", protect, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ _id: req.params.portfolioId, user: req.user._id });
        if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

        const deleted = await Position.findOneAndDelete({ _id: req.params.positionId, portfolio: portfolio._id });
        if (!deleted) return res.status(404).json({ message: "Position not found" });

        res.json({ message: "Position deleted successfully" });
    } catch (err) {
        console.error("Error deleting position:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;