// src/services/historicalVarService.js
import MarketPrice from "../models/MarketPrice.js";

/**
 * Compute Historical VaR from real historical returns
 * @param {Array} positions - [{ symbol, quantity }]
 * @param {Number} confidence - e.g. 0.95
 * @param {Number} horizonDays - usually 1
 */
export async function computeHistoricalVaR(positions, confidence, horizonDays) {
    const days = 60; // look-back window
    const priceSeries = {};

    // 1️⃣ Fetch price histories
    for (let pos of positions) {
        const history = await MarketPrice.find({ symbol: pos.symbol })
            .sort({ timestamp: -1 })
            .limit(days);

        if (history.length < 2) continue;
        priceSeries[pos.symbol] = history.map(h => h.price).reverse();
    }

    if (Object.keys(priceSeries).length === 0) {
        throw new Error("No sufficient price data for Historical VaR");
    }

    // 2️⃣ Compute daily returns per symbol
    const returns = {};
    for (const sym in priceSeries) {
        const prices = priceSeries[sym];
        returns[sym] = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
    }

    // 3️⃣ Compute portfolio daily returns
    const numDays = Math.min(...Object.values(returns).map(r => r.length));
    const portfolioReturns = [];

    for (let d = 0; d < numDays; d++) {
        let totalValue = 0;
        let dailyReturn = 0;

        // compute total portfolio value for weighting
        for (const pos of positions) {
            const lastPrice = priceSeries[pos.symbol].slice(-1)[0];
            totalValue += pos.quantity * lastPrice;
        }

        // weighted return each day
        for (const pos of positions) {
            const lastPrice = priceSeries[pos.symbol].slice(-1)[0];
            const weight = (pos.quantity * lastPrice) / totalValue;
            const symReturns = returns[pos.symbol];
            dailyReturn += weight * symReturns[symReturns.length - numDays + d];
        }

        portfolioReturns.push(dailyReturn);
    }

    // 4️⃣ Compute quantile return (e.g., 5% worst case for 95% confidence)
    portfolioReturns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * portfolioReturns.length);
    const quantileReturn = portfolioReturns[index];

    // 5️⃣ Compute portfolio value and VaR
    const portfolioValue = positions.reduce((sum, pos) => {
        const last = priceSeries[pos.symbol].slice(-1)[0];
        return sum + pos.quantity * last;
    }, 0);

    const varValue = -portfolioValue * quantileReturn * Math.sqrt(horizonDays);

    return { portfolioValue, varValue, quantileReturn };
}