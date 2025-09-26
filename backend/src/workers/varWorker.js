import { Worker } from "bullmq";
import IORedis from "ioredis";
import VaRRun from "../models/VaRRun.js";
import Portfolio from "../models/Portfolio.js";
import Position from "../models/Position.js";
import { computeMonteCarloVaR } from "../services/varService.js"; // we’ll define this

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

export const varWorker = new Worker(
    "montecarlo-var",
    async job => {
        const { runId } = job.data;

        const run = await VaRRun.findById(runId);
        if (!run) throw new Error("VaRRun not found");

        await VaRRun.findByIdAndUpdate(runId, { status: "running" });

        const portfolio = await Portfolio.findById(run.portfolio);
        const positions = await Position.find({ portfolio: portfolio._id });

        const simulationResult = await computeMonteCarloVaR(positions, run.params.confidence, run.params.horizonDays, run.params.simulations);

        run.result = simulationResult;
        run.status = "completed";
        await run.save();

        return run;
    },
    { connection }
);

varWorker.on("completed", job => console.log(`Job ${job.id} completed.`));
varWorker.on("failed", (job, err) => console.error(`Job ${job.id} failed:`, err));