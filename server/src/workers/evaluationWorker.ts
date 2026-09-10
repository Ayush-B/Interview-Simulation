import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";

import { prisma } from "../config/prisma";
import type { EvaluationJobData } from "../queues/evaluationQueue";

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

    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId
      },

      include: {
        questions: {
          include: {
            answer: true
          }
        }
      }
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    if (interview.questions.length === 0) {
      throw new Error("Interview contains no questions");
    }

    const unanswered = interview.questions.filter(
      (item) => !item.answer
    );

    if (unanswered.length > 0) {
      throw new Error(
        `Interview still has ${unanswered.length} unanswered question(s)`
      );
    }

    await prisma.evaluation.upsert({
      where: {
        interviewId
      },

      create: {
        interviewId,
        status: "PROCESSING"
      },

      update: {
        status: "PROCESSING",
        errorMessage: null
      }
    });

    let correctAnswers = 0;

    for (const item of interview.questions) {
      if (item.answer?.isCorrect) {
        correctAnswers++;
      }
    }

    const totalQuestions = interview.questions.length;

    const score = Number(
      ((correctAnswers / totalQuestions) * 100).toFixed(2)
    );

    const feedback = {
      correctAnswers,
      totalQuestions,
      summary:
        score >= 80
          ? "Strong performance"
          : score >= 60
            ? "Good performance with some areas to improve"
            : "More practice is recommended"
    };

    await prisma.$transaction([
      prisma.evaluation.update({
        where: {
          interviewId
        },

        data: {
          status: "COMPLETED",
          score,
          feedback,
          completedAt: new Date(),
          errorMessage: null
        }
      }),

      prisma.interview.update({
        where: {
          id: interviewId
        },

        data: {
          status: "COMPLETED",
          completedAt: new Date()
        }
      })
    ]);

    return {
      interviewId,
      score,
      correctAnswers,
      totalQuestions
    };
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

worker.on("failed", (job, error) => {
  console.error(
    `Evaluation job ${job?.id ?? "unknown"} failed:`,
    error.message
  );
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