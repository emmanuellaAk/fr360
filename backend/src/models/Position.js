import mongoose from "mongoose";

const positionSchema = new mongoose.Schema({
    portfolio:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portfolio",
        required: true
    },
    symbol: {
        type: String,
        required: [true, "Symbol is required"],
        uppercase: true, // ensures e.g. "aapl" -> "AAPL"
        trim: true
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be greater than 0"],
    },
    avgPrice: {
        type: Number,
        required: true,
        min: [0, "Average price cannot be negative"]
    },
    currency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "JPY", "GHS"]//take from an api
    }
}, { timestamps: true });

positionSchema.index({ portfolio: 1, symbol: 1 }, { unique: true });

const Position = mongoose.model("Position", positionSchema);
export default Position;
