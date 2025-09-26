import MarketPrice from "../models/MarketPrice.js";

export async function getLatestPrice(symbol) {
    const price = await MarketPrice.findOne({ symbol: symbol.toUpperCase() })
        .sort({ timestamp: -1 });
    return price ? price.price : null;
}