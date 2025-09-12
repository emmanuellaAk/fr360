import express from 'express';
import notesRoutes from "./routes/notesRoutes.js"
import authRoutes from "../src/routes/auth.js"
import categoryRoutes from "../src/routes/category.js"
// import incomeRoutes from "../src/routes/incomeRoutes.js"
import { protect } from './middleware/auth.js';
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
app.use("/api/categories", categoryRoutes)
// app.use("/api/expenses",expenseRoutes);
// app.use("/api/income", incomeRoutes);


app.listen(PORT, () => (
    console.log("Server started on PORT:", PORT)
))
