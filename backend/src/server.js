import express from 'express';
import notesRoutes from "./routes/notesRoutes.js"
import authRoutes from "../src/routes/auth.js"
import { connectDB } from '../config/db.js';
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
connectDB();

//midddleware
app.use(express.json());
//endpoints
app.use("/api/notes", notesRoutes);
app.use("/api/users", authRoutes);


app.listen(PORT, () => (
    console.log("Server started on PORT:", PORT)
))
