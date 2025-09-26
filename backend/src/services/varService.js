import MarketPrice from "../models/MarketPrice.js";

/**
 * Compute Parametric VaR (Variance-Covariance Method)
 * @param {Array} positions - [{ symbol, quantity, avgPrice }]
 * @param {Number} confidence - e.g. 0.95
 * @param {Number} horizonDays - usually 1
 */
export async function computeParametricVaR(positions, confidence, horizonDays) {
    // fetch historical prices for each symbol (last 60 days)
    const days = 60;
    const priceSeries = {};

    for (let pos of positions) {
        const history = await MarketPrice.find({ symbol: pos.symbol })
            .sort({ timestamp: -1 })
            .limit(days);

        if (history.length < 2) continue;

        // reverse order oldest → newest
        const prices = history.map(h => h.price).reverse();
        priceSeries[pos.symbol] = prices;
    }

    // compute returns
    const returns = {};
    for (let symbol in priceSeries) {
        const series = priceSeries[symbol];
        returns[symbol] = [];
        for (let i = 1; i < series.length; i++) {
            returns[symbol].push((series[i] - series[i - 1]) / series[i - 1]);
        }
    }

    // compute portfolio daily returns
    const portfolioReturns = [];
    const numDays = Math.min(...Object.values(returns).map(r => r.length));

    for (let d = 0; d < numDays; d++) {
        let dailyReturn = 0;
        let totalValue = 0;

        for (let pos of positions) {
            const lastPrice = priceSeries[pos.symbol].slice(-1)[0];
            const weight = (pos.quantity * lastPrice);
            totalValue += weight;
        }

        for (let pos of positions) {
            const lastPrice = priceSeries[pos.symbol].slice(-1)[0];
            const weight = (pos.quantity * lastPrice) / totalValue;
            dailyReturn += weight * returns[pos.symbol][returns[pos.symbol].length - numDays + d];
        }

        portfolioReturns.push(dailyReturn);
    }

    // mean and std dev
    const mean = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
    const variance = portfolioReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / portfolioReturns.length;
    const stdDev = Math.sqrt(variance);

    // z-score for confidence (95% → 1.65, 99% → 2.33)
    const zScores = { 0.95: 1.65, 0.99: 2.33 };
    const z = zScores[confidence] || 1.65;

    // latest portfolio value
    let portfolioValue = 0;
    for (let pos of positions) {
        const lastPrice = priceSeries[pos.symbol].slice(-1)[0];
        portfolioValue += pos.quantity * lastPrice;
    }

    const varValue = -portfolioValue * (mean - z * stdDev) * Math.sqrt(horizonDays);

    return { portfolioValue, varValue };
}