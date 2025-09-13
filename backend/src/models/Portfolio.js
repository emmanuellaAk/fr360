import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Portfolio name is required"],
    },
    baseCurrency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "JPY", "GHS"],//pull from some api
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

portfolioSchema.index({ user: 1, name: 1 }, { unique: true });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;
