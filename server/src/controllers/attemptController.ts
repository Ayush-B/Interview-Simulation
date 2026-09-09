import type { RequestHandler } from "express";
import { prisma } from "../config/prisma";
import type { AuthenticatedRequest } from "../middleware/auth";

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export const submitAttempt: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { questionId, userAnswer } = req.body ?? {};

    if (!userId) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    if (!questionId || !userAnswer) {
      res.status(400).json({
        error: "questionId and userAnswer are required"
      });
      return;
    }

    const question = await prisma.question.findUnique({
      where: {
        id: String(questionId)
      }
    });

    if (!question) {
      res.status(404).json({
        error: "question not found"
      });
      return;
    }

    const expected = question.correctAnswer ?? "";

    const isCorrect =
      normalize(userAnswer) === normalize(expected);

    const interview = await prisma.interview.create({
      data: {
        userId,
        role: question.role,
        status: "COMPLETED",
        completedAt: new Date(),

        questions: {
          create: {
            questionId: question.id,
            position: 1,

            answer: {
              create: {
                questionSnapshot: question.prompt,
                response: String(userAnswer),
                isCorrect,
                correctAnswer: expected || null
              }
            }
          }
        }
      },

      include: {
        questions: {
          include: {
            answer: true
          }
        }
      }
    });

    const answer = interview.questions[0]?.answer;

    res.status(201).json({
      attemptId: answer?.id,
      isCorrect,
      correctAnswer: expected,
      createdAt: answer?.submittedAt
    });
  } catch (error) {
    next(error);
  }
};

export const getAttempts: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      res.status(401).json({
        error: "unauthorized"
      });
      return;
    }

    const answers = await prisma.answer.findMany({
      where: {
        interviewQuestion: {
          interview: {
            userId
          }
        }
      },

      orderBy: {
        submittedAt: "desc"
      },

      take: 50,

      select: {
        questionSnapshot: true,
        response: true,
        isCorrect: true,
        correctAnswer: true,
        submittedAt: true
      }
    });

    res.json(
      answers.map((answer) => ({
        questionText: answer.questionSnapshot,
        userAnswer: answer.response,
        isCorrect: answer.isCorrect,
        correctAnswer: answer.correctAnswer,
        createdAt: answer.submittedAt
      }))
    );
  } catch (error) {
    next(error);
  }
};