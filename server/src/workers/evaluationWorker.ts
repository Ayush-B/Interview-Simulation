import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";

import { prisma } from "../config/prisma";
import type { EvaluationJobData } from "../queues/evaluationQueue";
import {
  evaluateInterview,
  markEvaluationFailed
} from "../services/evaluationService";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing");
}

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null
});

const worker = new Worker<EvaluationJobData>(
  "interview-evaluation",

  async (job) => {
    const { interviewId, userId } = job.data;

    console.log(`Evaluating interview ${interviewId}`);

    return evaluateInterview(
      interviewId,
      userId
    );
  },

  {
    connection,
    concurrency: 5
  }
);

worker.on("completed", (job, result) => {
  console.log(
    `Evaluation completed for ${job.data.interviewId}: ${result.score}%`
  );
});


worker.on("failed", async (job, error) => {
  if (!job) {
    console.error(
      "Evaluation job failed without job information:",
      error.message
    );
    return;
  }

  const maxAttempts = job.opts.attempts ?? 1;
  const attemptsMade = job.attemptsMade;

  console.error(
    `Evaluation job ${job.id ?? "unknown"} failed ` +
      `(attempt ${attemptsMade}/${maxAttempts}):`,
    error.message
  );

  /*
   * BullMQ will retry the job automatically while attempts remain.
   * Do NOT mark the interview FAILED yet.
   */
  if (attemptsMade < maxAttempts) {
    console.log(
      `Evaluation will be retried for interview ${job.data.interviewId}`
    );
    return;
  }

  /*
   * All configured attempts have been exhausted.
   * Now this is a permanent failure from our application's perspective.
   */
  try {
    await markEvaluationFailed(
      job.data.interviewId,
      job.data.userId,
      error.message
    );

    console.error(
      `Evaluation permanently failed for interview ${job.data.interviewId}`
    );
  } catch (databaseError) {
    console.error(
      "Failed to persist evaluation failure:",
      databaseError
    );
  }
});

console.log("Evaluation worker is running");

async function shutdown(): Promise<void> {
  console.log("Shutting down evaluation worker");

  await worker.close();
  await connection.quit();
  await prisma.$disconnect();

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);