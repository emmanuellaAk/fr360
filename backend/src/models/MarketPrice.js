import mongoose from "mongoose";

const marketPriceSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        index: true
    },
    price: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: false });

marketPriceSchema.index({ symbol: 1, timestamp: -1 });

const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema);
export default MarketPrice;