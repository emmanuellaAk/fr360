import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    amount: {
       type: Number,
       required:true
    },
    
})