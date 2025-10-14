import { Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import mongoose from "mongoose";
import VaRRun from "../models/VaRRun.js";
import Portfolio from "../models/Portfolio.js";
import Position from "../models/Position.js";
import { computeMonteCarloVaR } from "../services/montecarloService.js";


dotenv.config();

// connect mongo (worker runs as separate process)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected in varWorker..."))
  .catch(err => console.error("Mongo error:", err));

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});
const worker = new Worker(
  "montecarlo-var",
  async job => {
    const { runId } = job.data;
    console.log(`Processing job ${job.id} for VaRRun ${runId}`);

    // mark running
    await VaRRun.findByIdAndUpdate(runId, { status: "running" });

    const run = await VaRRun.findById(runId);
    if (!run) throw new Error("VaRRun not found");

    const portfolio = await Portfolio.findById(run.portfolio);
    if (!portfolio) throw new Error("Portfolio not found");

    const positions = await Position.find({ portfolio: portfolio._id });

    // set simulation count from params or default
    const sims = run.params.simulations || 5000;

    // compute
    const result = await computeMonteCarloVaR(
      positions.map(p => ({ symbol: p.symbol, quantity: p.quantity, avgPrice: p.avgPrice })),
      run.params.confidence,
      run.params.horizonDays,
      sims
    );

    run.result = result;
    run.status = "completed";
    run.completedAt = new Date();
    await run.save();

    return run;
  },
  { connection }
);

worker.on("completed", (job, returnvalue) => {
  console.log(`Job ${job.id} completed`);
});
worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

process.on("SIGINT", async () => {
  await worker.close();
  await mongoose.disconnect();
  connection.disconnect();
  process.exit(0);
});

console.log("✅ Monte Carlo varWorker started and listening for jobs...");