import express from 'express';
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "../src/routes/auth.js"
import portfolioRoutes from "../src/routes/portfolioRoutes.js"
import positionsRoutes from "../src/routes/positionRoutes.js"
import marketRoutes from "../src/routes/marketRoutes.js"
import varRoutes from "./routes/varRoutes.js";
import dotenv from "dotenv";
import { connectDB } from '../config/db.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
const PORT = process.env.PORT || 5000;
connectDB();

//middleware
app.use(express.json());
//endpoints

app.use("/api/users", authRoutes);
app.use("/api/portfolios", portfolioRoutes)
app.use("/api/portfolios/:portfolioId/var", varRoutes);
app.use("/api/portfolios/:portfolioId/positions", positionsRoutes)
app.use("/api/market", marketRoutes)


app.listen(PORT, () => (
    console.log("Server started on PORT:", PORT)
))

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
