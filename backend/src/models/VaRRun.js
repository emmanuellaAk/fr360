import mongoose from "mongoose";

const VaRRunSchema = new mongoose.Schema({
    portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portfolio",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    method: {
        type: String,
        enum: ["parametric", "historical", "montecarlo"],
        required: true
    },
    params: {
        confidence: { type: Number, required: true },
        horizonDays: { type: Number, required: true }
    },
    result: {
        portfolioValue: Number,
        varValue: Number,
        quantileReturn : Number,
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("VaRRun", VaRRunSchema);