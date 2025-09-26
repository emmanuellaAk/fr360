import express from 'express';
import authRoutes from "../src/routes/auth.js"
import portfolioRoutes from "../src/routes/portfolioRoutes.js"
import positionsRoutes from "../src/routes/positionRoutes.js"
import marketRoutes from "../src/routes/marketRoutes.js"
import varRoutes from "./routes/varRoutes.js";
import dotenv from "dotenv";
import { connectDB } from '../config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
connectDB();

//midddleware
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
