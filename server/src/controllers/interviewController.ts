import { enqueueEvaluation } from "../queues/evaluationQueue";
import type { RequestHandler } from "express";
import { prisma } from "../config/prisma";
import type { AuthenticatedRequest } from "../middleware/auth";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export const createInterview: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const {
      role,
      type,
      questionCount = 5
    } = req.body ?? {};

    if (!role || !type) {
      res.status(400).json({
        error: "role and type are required"
      });
      return;
    }

    const count = Number(questionCount);

    if (!Number.isInteger(count) || count < 1 || count > 10) {
      res.status(400).json({
        error: "questionCount must be between 1 and 10"
      });
      return;
    }

    const normalizedRole = String(role).trim().toUpperCase();
    const normalizedType = String(type).trim().toLowerCase();

    const availableQuestions = await prisma.question.findMany({
      where: {
        role: normalizedRole,
        type: normalizedType,
        isActive: true
      },
      select: {
        id: true
      }
    });

    if (availableQuestions.length < count) {
      res.status(409).json({
        error: `only ${availableQuestions.length} questions are available`
      });
      return;
    }

    const selectedQuestions = shuffle(availableQuestions).slice(0, count);

    const interview = await prisma.interview.create({
      data: {
        userId,
        role: normalizedRole,
        type: normalizedType,

        questions: {
          create: selectedQuestions.map((question, index) => ({
            questionId: question.id,
            position: index + 1
          }))
        }
      },

      include: {
        questions: {
          orderBy: {
            position: "asc"
          },

          select: {
            position: true,

            question: {
              select: {
                id: true,
                prompt: true
              }
            },

            answer: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      id: interview.id,
      role: interview.role,
      type: interview.type,
      status: interview.status,
      startedAt: interview.startedAt,
      progress: {
        answered: 0,
        total: interview.questions.length
      },
      questions: interview.questions.map((item) => ({
        id: item.question.id,
        position: item.position,
        question_text: item.question.prompt,
        answered: Boolean(item.answer)
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getInterview: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const rawInterviewId = req.params.id;

    if (!rawInterviewId || Array.isArray(rawInterviewId)) {
      res.status(400).json({
        error: "invalid interview id"
      });
      return;
    }

    const interviewId = rawInterviewId;

    if (!userId) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId
      },

      include: {
        questions: {
          orderBy: {
            position: "asc"
          },

          include: {
            question: {
              select: {
                id: true,
                prompt: true
              }
            },

            answer: {
              select: {
                id: true,
                response: true,
                submittedAt: true
              }
            }
          }
        }
      }
    });

    if (!interview) {
      res.status(404).json({
        error: "interview not found"
      });
      return;
    }

    const answeredCount = interview.questions.filter(
      (item) => Boolean(item.answer)
    ).length;

    res.json({
      id: interview.id,
      role: interview.role,
      type: interview.type,
      difficulty: interview.difficulty,
      status: interview.status,
      startedAt: interview.startedAt,
      completedAt: interview.completedAt,

      progress: {
        answered: answeredCount,
        total: interview.questions.length
      },

      questions: interview.questions.map((item) => ({
        id: item.question.id,
        position: item.position,
        question_text: item.question.prompt,
        answered: Boolean(item.answer),

        response: item.answer?.response ?? null,
        submittedAt: item.answer?.submittedAt ?? null
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getNextQuestion: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const rawInterviewId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    if (!rawInterviewId || Array.isArray(rawInterviewId)) {
      res.status(400).json({
        error: "invalid interview id"
      });
      return;
    }

    const interviewId = rawInterviewId;

    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId
      },
      select: {
        id: true,
        status: true
      }
    });

    if (!interview) {
      res.status(404).json({
        error: "interview not found"
      });
      return;
    }

    if (interview.status === "COMPLETED") {
      res.status(409).json({
        error: "interview is already completed"
      });
      return;
    }

    const nextQuestion = await prisma.interviewQuestion.findFirst({
      where: {
        interviewId,
        answer: null
      },
      orderBy: {
        position: "asc"
      },
      select: {
        id: true,
        position: true,

        question: {
          select: {
            id: true,
            prompt: true
          }
        }
      }
    });

    if (!nextQuestion) {
      res.status(404).json({
        error: "no unanswered questions remain"
      });
      return;
    }

    res.json({
      interviewQuestionId: nextQuestion.id,
      questionId: nextQuestion.question.id,
      position: nextQuestion.position,
      question_text: nextQuestion.question.prompt
    });
  } catch (error) {
    next(error);
  }
};

export const submitInterviewAnswer: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const rawInterviewId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    if (!rawInterviewId || Array.isArray(rawInterviewId)) {
      res.status(400).json({
        error: "invalid interview id"
      });
      return;
    }

    const interviewId = rawInterviewId;

    const {
      interviewQuestionId,
      response
    } = req.body ?? {};

    if (!interviewQuestionId || !response) {
      res.status(400).json({
        error: "interviewQuestionId and response are required"
      });
      return;
    }

    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId
      },
      select: {
        id: true,
        status: true
      }
    });

    if (!interview) {
      res.status(404).json({
        error: "interview not found"
      });
      return;
    }

    if (interview.status !== "ACTIVE") {
      res.status(409).json({
        error: `interview is ${interview.status.toLowerCase()}`
      });
      return;
    }

    const assignedQuestion =
      await prisma.interviewQuestion.findFirst({
        where: {
          id: String(interviewQuestionId),
          interviewId
        },

        include: {
          question: true,
          answer: true
        }
      });

    if (!assignedQuestion) {
      res.status(404).json({
        error: "question is not assigned to this interview"
      });
      return;
    }

    if (assignedQuestion.answer) {
      res.status(409).json({
        error: "question has already been answered"
      });
      return;
    }

    const submittedResponse = String(response).trim();

    if (!submittedResponse) {
      res.status(400).json({
        error: "response cannot be empty"
      });
      return;
    }

    const expectedAnswer =
      assignedQuestion.question.correctAnswer ?? "";

    const isCorrect =
      submittedResponse.toLowerCase() ===
      expectedAnswer.trim().toLowerCase();

    const result = await prisma.$transaction(async (tx) => {
      const answer = await tx.answer.create({
        data: {
          interviewQuestionId: assignedQuestion.id,
          questionSnapshot: assignedQuestion.question.prompt,
          response: submittedResponse,
          isCorrect,
          correctAnswer: expectedAnswer || null
        }
      });

      const remainingQuestions =
        await tx.interviewQuestion.count({
          where: {
            interviewId,
            answer: null
          }
        });

      const totalQuestions =
        await tx.interviewQuestion.count({
          where: {
            interviewId
          }
        });

      const readyForEvaluation = remainingQuestions === 0;

      if (readyForEvaluation) {
        await tx.interview.update({
          where: {
            id: interviewId
          },
          data: {
            status: "EVALUATING"
          }
        });

        await tx.evaluation.upsert({
          where: {
            interviewId
          },
          create: {
            interviewId,
            status: "PENDING"
          },
          update: {
            status: "PENDING",
            errorMessage: null,
            completedAt: null
          }
        });
      }

      return {
        answer,
        remainingQuestions,
        totalQuestions,
        readyForEvaluation
      };
    });

    let evaluationJobId: string | undefined;

    if (result.readyForEvaluation) {
      try {
        const job = await enqueueEvaluation(
          interviewId,
          userId
        );

        evaluationJobId = job.id;
      } catch (queueError) {
        const message =
          queueError instanceof Error
            ? queueError.message
            : "Failed to enqueue evaluation";

        await prisma.$transaction([
          prisma.evaluation.update({
            where: {
              interviewId
            },
            data: {
              status: "FAILED",
              errorMessage: message
            }
          }),

          prisma.interview.update({
            where: {
              id: interviewId
            },
            data: {
              status: "FAILED"
            }
          })
        ]);

        throw queueError;
      }
    }

    res.status(201).json({
      answerId: result.answer.id,
      interviewQuestionId: assignedQuestion.id,
      position: assignedQuestion.position,
      isCorrect,

      progress: {
        answered:
          result.totalQuestions - result.remainingQuestions,
        total: result.totalQuestions
      },

      status: result.readyForEvaluation
        ? "EVALUATING"
        : "ACTIVE",

      evaluationJobId
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewEvaluation: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const rawInterviewId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    if (!rawInterviewId || Array.isArray(rawInterviewId)) {
      res.status(400).json({
        error: "invalid interview id"
      });
      return;
    }

    const interviewId = rawInterviewId;

    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId
      },

      select: {
        id: true,
        status: true,

        evaluation: {
          select: {
            status: true,
            score: true,
            feedback: true,
            errorMessage: true,
            createdAt: true,
            updatedAt: true,
            completedAt: true
          }
        }
      }
    });

    if (!interview) {
      res.status(404).json({
        error: "interview not found"
      });
      return;
    }

    if (!interview.evaluation) {
      res.status(404).json({
        error: "evaluation has not been created yet"
      });
      return;
    }

    res.json({
      interviewId: interview.id,
      interviewStatus: interview.status,
      evaluation: interview.evaluation
    });
  } catch (error) {
    next(error);
  }
};