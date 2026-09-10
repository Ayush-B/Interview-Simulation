import { prisma } from "../config/prisma";

export async function evaluateInterview(
  interviewId: string,
  userId: string
) {
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

  const correctAnswers = interview.questions.filter(
    (item) => item.answer?.isCorrect
  ).length;

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
}

export async function markEvaluationFailed(
  interviewId: string,
  userId: string,
  errorMessage: string
): Promise<void> {
  await prisma.$transaction([
    prisma.evaluation.updateMany({
      where: {
        interviewId
      },
      data: {
        status: "FAILED",
        errorMessage
      }
    }),

    prisma.interview.updateMany({
      where: {
        id: interviewId,
        userId
      },
      data: {
        status: "FAILED"
      }
    })
  ]);
}