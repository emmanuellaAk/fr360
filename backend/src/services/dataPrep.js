
import Position from "../models/Position.js";
import Portfolio from "../models/Portfolio.js";
import MarketPrice from "../models/MarketPrice.js";
import { getLatestPrice } from "../services/marketService.js";

/**
 * Get all positions for a given portfolio.
 */
// export async function getPortfolioPositions(portfolioId) {
//     return await Position.find({ portfolio: portfolioId });
// }

/**
 * Enrich a position with latest market data.
 */
export async function enrichPositionWithLatest(pos) {
    const latestPrice = await getLatestPrice(pos.symbol);
    if (!latestPrice) return null;

    const marketValue = pos.quantity * latestPrice;
    const costBasis = pos.quantity * pos.avgPrice;
    const unrealizedPnL = marketValue - costBasis;

    return {
        symbol: pos.symbol,
        quantity: pos.quantity,
        avgPrice: pos.avgPrice,
        latestPrice,
        marketValue,
        unrealizedPnL
    };
}

/**
 * Get a fully enriched portfolio snapshot (with latest prices).
 */
export async function getEnrichedPortfolio(portfolioId, userId) {
    const portfolio = await Portfolio.findOne({ _id: portfolioId, user: userId });
    if (!portfolio) throw new Error("Portfolio not found");

    const positions = await getPortfolioPositions(portfolioId);
    const enrichedPositions = [];
    let totalValue = 0;

    for (let pos of positions) {
        const enriched = await enrichPositionWithLatest(pos);
        if (enriched) {
            totalValue += enriched.marketValue;
            enrichedPositions.push(enriched);
        }
    }

    return {
        portfolioId: portfolio._id,
        name: portfolio.name,
        baseCurrency: portfolio.baseCurrency,
        totalValue,
        positions: enrichedPositions
    };
}

export async function getPortfolioPositions(portfolioId) {
    const positions = await Position.find({ portfolio: portfolioId });

    let totalValue = 0;
    let totalInvested = 0;
    const enriched = [];

    for (let pos of positions) {
        const latestPrice = await getLatestPrice(pos.symbol);
        if (!latestPrice) continue;

        const marketValue = pos.quantity * latestPrice;
        const costBasis = pos.quantity * pos.avgPrice;
        const unrealizedPnL = marketValue - costBasis;

        totalValue += marketValue;
        totalInvested += costBasis;

        enriched.push({
            symbol: pos.symbol,
            quantity: pos.quantity,
            avgPrice: pos.avgPrice,
            latestPrice,
            marketValue,
            unrealizedPnL,
        });
    }

    return {
        positions: enriched,
        totalValue,
        totalInvested,
    };
}

/**
 * Fetch historical price series for a symbol.
 * @param {string} symbol 
 * @param {Date} from 
 * @param {Date} to 
 */
export async function getHistoricalPrices(symbol, from, to) {
    return await MarketPrice.find({
        symbol,
        timestamp: { $gte: from, $lte: to }
    }).sort({ timestamp: 1 });
}