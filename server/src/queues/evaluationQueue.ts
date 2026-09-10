import "dotenv/config";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing");
}

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: 1
});

export interface EvaluationJobData {
  interviewId: string;
  userId: string;
}

export const evaluationQueue =
  new Queue<EvaluationJobData>("interview-evaluation", {
    connection
  });

export async function enqueueEvaluation(
  interviewId: string,
  userId: string
) {
  return evaluationQueue.add(
    "evaluate-interview",
    {
      interviewId,
      userId
    },
    {
      jobId: `evaluation-${interviewId}`,

      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 2000
      },

      removeOnComplete: {
        age: 3600,
        count: 500
      },

      removeOnFail: {
        age: 86400
      }
    }
  );
}