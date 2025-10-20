// routes/dashboardRoutes.js
import express from "express";
import Portfolio from "../models/Portfolio.js";
import VaRRun from "../models/VaRRun.js";
import { protect } from "../middleware/auth.js";
import Position from "../models/Position.js";
import { getLatestPrice } from "../services/marketService.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id });
    let totalValue = 0;

    for (const p of portfolios) {
      const positions = await Position.find({ portfolio: p._id });
      for (const pos of positions) {
        const latestPrice = await getLatestPrice(pos.symbol);
        totalValue += pos.quantity * (latestPrice || 0);
      }
    }

    const totalPortfolios = portfolios.length;
    const avgValue = totalPortfolios > 0 ? totalValue / totalPortfolios : 0;

    const latestVar = await VaRRun.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("portfolio", "name");

    const recentVarRuns = await VaRRun.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("portfolio", "name");

    res.json({
      totalPortfolios,
      totalValue,
      avgValue,
      latestVar95: latestVar?.result?.value95 ?? null,
      lastUpdated: new Date(),
      recentVarRuns: recentVarRuns.map(r => ({
        date: r.createdAt,
        portfolio: r.portfolio.name,
        var95: r.result?.value95 ?? null,
        value: r.result?.portfolioValue ?? null,
        method: r.method
      }))
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;