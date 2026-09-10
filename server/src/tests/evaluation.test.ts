import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it
} from "vitest";

import { prisma } from "../config/prisma";
import {
  evaluateInterview,
  markEvaluationFailed
} from "../services/evaluationService";

const email = "evaluation-test@example.com";
const role = "EVAL_TEST";

describe("Interview evaluation service", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email
      }
    });

    await prisma.question.deleteMany({
      where: {
        role
      }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email
      }
    });

    await prisma.question.deleteMany({
      where: {
        role
      }
    });

    await prisma.$disconnect();
  });

  it("calculates the score and completes the interview", async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: "test-hash"
      }
    });

    const createdQuestions = [];

    for (let i = 1; i <= 5; i++) {
      const question = await prisma.question.create({
        data: {
          role,
          type: "technical",
          prompt: `Evaluation question ${i}`,
          correctAnswer: `answer ${i}`,
          explanation: `Explanation ${i}`
        }
      });

      createdQuestions.push(question);
    }

    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        role,
        type: "technical",
        status: "EVALUATING",

        questions: {
          create: createdQuestions.map(
            (question, index) => ({
              questionId: question.id,
              position: index + 1,

              answer: {
                create: {
                  questionSnapshot: question.prompt,

                  response:
                    index < 3
                      ? `answer ${index + 1}`
                      : "wrong answer",

                  isCorrect: index < 3,

                  correctAnswer:
                    question.correctAnswer
                }
              }
            })
          )
        },

        evaluation: {
          create: {
            status: "PENDING"
          }
        }
      }
    });

    const result = await evaluateInterview(
      interview.id,
      user.id
    );

    expect(result.correctAnswers).toBe(3);
    expect(result.totalQuestions).toBe(5);
    expect(result.score).toBe(60);

    const storedEvaluation =
      await prisma.evaluation.findUnique({
        where: {
          interviewId: interview.id
        }
      });

    expect(
      storedEvaluation?.status
    ).toBe("COMPLETED");

    expect(
      storedEvaluation?.score
    ).toBe(60);

    expect(
      storedEvaluation?.completedAt
    ).not.toBeNull();

    const storedInterview =
      await prisma.interview.findUnique({
        where: {
          id: interview.id
        }
      });

    expect(
      storedInterview?.status
    ).toBe("COMPLETED");

    expect(
      storedInterview?.completedAt
    ).not.toBeNull();
  });

  it("rejects evaluation when questions are still unanswered", async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: "test-hash"
      }
    });

    const firstQuestion = await prisma.question.create({
      data: {
        role,
        type: "technical",
        prompt: "Incomplete evaluation question 1",
        correctAnswer: "answer 1",
        explanation: "Test explanation"
      }
    });

    const secondQuestion = await prisma.question.create({
      data: {
        role,
        type: "technical",
        prompt: "Incomplete evaluation question 2",
        correctAnswer: "answer 2",
        explanation: "Test explanation"
      }
    });

    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        role,
        type: "technical",
        status: "EVALUATING",

        questions: {
          create: [
            {
              questionId: firstQuestion.id,
              position: 1,

              answer: {
                create: {
                  questionSnapshot:
                    firstQuestion.prompt,

                  response: "answer 1",

                  isCorrect: true,

                  correctAnswer:
                    firstQuestion.correctAnswer
                }
              }
            },

            {
              questionId: secondQuestion.id,
              position: 2
            }
          ]
        },

        evaluation: {
          create: {
            status: "PENDING"
          }
        }
      }
    });

    await expect(
      evaluateInterview(
        interview.id,
        user.id
      )
    ).rejects.toThrow(
      "Interview still has 1 unanswered question(s)"
    );

    const evaluation =
      await prisma.evaluation.findUnique({
        where: {
          interviewId: interview.id
        }
      });

    expect(
      evaluation?.status
    ).toBe("PENDING");

    const storedInterview =
      await prisma.interview.findUnique({
        where: {
          id: interview.id
        }
      });

    expect(
      storedInterview?.status
    ).toBe("EVALUATING");
  });

  it("marks the evaluation and interview as FAILED after a permanent failure", async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: "test-hash"
      }
    });

    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        role,
        type: "technical",
        status: "EVALUATING",

        evaluation: {
          create: {
            status: "PENDING"
          }
        }
      }
    });

    const errorMessage =
      "Evaluation service unavailable after retries";

    await markEvaluationFailed(
      interview.id,
      user.id,
      errorMessage
    );

    const storedEvaluation =
      await prisma.evaluation.findUnique({
        where: {
          interviewId: interview.id
        }
      });

    expect(
      storedEvaluation?.status
    ).toBe("FAILED");

    expect(
      storedEvaluation?.errorMessage
    ).toBe(errorMessage);

    const storedInterview =
      await prisma.interview.findUnique({
        where: {
          id: interview.id
        }
      });

    expect(
      storedInterview?.status
    ).toBe("FAILED");
  });
});