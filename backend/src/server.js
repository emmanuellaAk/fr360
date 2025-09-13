import express from 'express';
import authRoutes from "../src/routes/auth.js"
import { protect } from './middleware/auth.js';
import { connectDB } from '../config/db.js';
import portfolioRoutes from "../src/routes/portfolioRoutes.js"
import positionsRoutes from "../src/routes/positionRoutes.js"
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
connectDB();

//midddleware
app.use(express.json());
//endpoints

app.use("/api/users", authRoutes);
app.use("/api/portfolios",portfolioRoutes)
app.use("/api/portfolios/:portfolioId/positions",positionsRoutes)



app.listen(PORT, () => (
    console.log("Server started on PORT:", PORT)
))
