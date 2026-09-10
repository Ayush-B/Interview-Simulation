import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import request from "supertest";

/*
 * Mock only the queue producer.
 *
 * These tests are focused on interview business logic,
 * not Redis/BullMQ behavior.
 *
 * Mocking enqueueEvaluation prevents a real worker from
 * immediately completing the interview before we can verify
 * the EVALUATING and PENDING states.
 */
vi.mock("../queues/evaluationQueue", () => ({
  enqueueEvaluation: vi.fn(
    async (interviewId: string) => ({
      id: `evaluation-${interviewId}`
    })
  )
}));

import app from "../app";
import { prisma } from "../config/prisma";

const role = "TEST_SESSION";
const type = "technical";

const ownerEmail =
  "interview-owner-test@example.com";

const secondUserEmail =
  "interview-other-test@example.com";

const password = "Password123!";

const questions = [
  "Test interview question 1?",
  "Test interview question 2?",
  "Test interview question 3?",
  "Test interview question 4?",
  "Test interview question 5?"
];

async function signup(email: string) {
  const response = await request(app)
    .post("/api/auth/signup")
    .send({
      email,
      password
    })
    .expect(201);

  return {
    token: response.body.token as string,
    userId: response.body.user.id as string
  };
}

async function createInterview(
  token: string
) {
  return request(app)
    .post("/api/interviews")
    .set(
      "Authorization",
      `Bearer ${token}`
    )
    .send({
      role,
      type,
      questionCount: 5
    })
    .expect(201);
}

describe("Interview workflow integration", () => {
  beforeAll(async () => {
    /*
     * Clean any old test questions first.
     */
    await prisma.question.deleteMany({
      where: {
        role,
        type
      }
    });

    /*
     * Create exactly five questions for this suite.
     */
    await prisma.question.createMany({
      data: questions.map(
        (prompt, index) => ({
          role,
          type,
          prompt,
          correctAnswer:
            `answer ${index + 1}`,
          explanation:
            `Explanation ${index + 1}`
        })
      )
    });
  });

  beforeEach(async () => {
    /*
     * Deleting the test users also removes
     * their interviews because of cascade rules.
     */
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            ownerEmail,
            secondUserEmail
          ]
        }
      }
    });
  });

  afterAll(async () => {
    /*
     * Final cleanup.
     */
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            ownerEmail,
            secondUserEmail
          ]
        }
      }
    });

    await prisma.question.deleteMany({
      where: {
        role,
        type
      }
    });

    await prisma.$disconnect();
  });

  it(
    "creates and persists the same five assigned questions",
    async () => {
      const { token } =
        await signup(ownerEmail);

      const created =
        await createInterview(token);

      expect(
        created.body.status
      ).toBe("ACTIVE");

      expect(
        created.body.questions
      ).toHaveLength(5);

      expect(
        created.body.questions.map(
          (
            question: {
              position: number;
            }
          ) => question.position
        )
      ).toEqual([
        1,
        2,
        3,
        4,
        5
      ]);

      /*
       * Reopen the interview.
       */
      const reopened = await request(app)
        .get(
          `/api/interviews/${created.body.id}`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .expect(200);

      expect(
        reopened.body.progress
      ).toEqual({
        answered: 0,
        total: 5
      });

      const originalIds =
        created.body.questions.map(
          (
            question: {
              id: string;
            }
          ) => question.id
        );

      const reopenedIds =
        reopened.body.questions.map(
          (
            question: {
              id: string;
            }
          ) => question.id
        );

      /*
       * Reopening must return the exact
       * same assigned questions.
       */
      expect(
        reopenedIds
      ).toEqual(originalIds);
    }
  );

  it(
    "prevents another user from accessing the interview",
    async () => {
      const owner =
        await signup(ownerEmail);

      const otherUser =
        await signup(secondUserEmail);

      const created =
        await createInterview(
          owner.token
        );

      /*
       * Another authenticated user should
       * not be able to retrieve this interview.
       */
      await request(app)
        .get(
          `/api/interviews/${created.body.id}`
        )
        .set(
          "Authorization",
          `Bearer ${otherUser.token}`
        )
        .expect(404);
    }
  );

  it(
    "moves to the next unanswered question after submission",
    async () => {
      const { token } =
        await signup(ownerEmail);

      const created =
        await createInterview(token);

      const interviewId =
        created.body.id;

      /*
       * Initially question #1 should be next.
       */
      const first = await request(app)
        .get(
          `/api/interviews/${interviewId}/next`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .expect(200);

      expect(
        first.body.position
      ).toBe(1);

      /*
       * Submit the first answer.
       */
      const submitted =
        await request(app)
          .post(
            `/api/interviews/${interviewId}/answers`
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send({
            interviewQuestionId:
              first.body
                .interviewQuestionId,

            response:
              "answer 1"
          })
          .expect(201);

      expect(
        submitted.body.status
      ).toBe("ACTIVE");

      expect(
        submitted.body.progress
      ).toEqual({
        answered: 1,
        total: 5
      });

      /*
       * Now question #2 should be next.
       */
      const next =
        await request(app)
          .get(
            `/api/interviews/${interviewId}/next`
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .expect(200);

      expect(
        next.body.position
      ).toBe(2);
    }
  );

  it(
    "rejects submitting an answer twice",
    async () => {
      const { token } =
        await signup(ownerEmail);

      const created =
        await createInterview(token);

      const interviewId =
        created.body.id;

      const next =
        await request(app)
          .get(
            `/api/interviews/${interviewId}/next`
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .expect(200);

      const body = {
        interviewQuestionId:
          next.body
            .interviewQuestionId,

        response:
          "answer 1"
      };

      /*
       * First submission succeeds.
       */
      await request(app)
        .post(
          `/api/interviews/${interviewId}/answers`
        )
        .set(
          "Authorization",
          `Bearer ${token}`
        )
        .send(body)
        .expect(201);

      /*
       * Second submission for the same
       * assigned question must fail.
       */
      const duplicate =
        await request(app)
          .post(
            `/api/interviews/${interviewId}/answers`
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send(body)
          .expect(409);

      expect(
        duplicate.body.error
      ).toBe(
        "question has already been answered"
      );
    }
  );

  it(
    "transitions to EVALUATING after the final answer",
    async () => {
      const { token } =
        await signup(ownerEmail);

      const created =
        await createInterview(token);

      const interviewId =
        created.body.id;

      let finalResponse:
  	| {
      	   body: {
              progress: {
          	 answered: number;
          	 total: number;
              };
              status: string;
              evaluationJobId?: string;
           };
          }
        | undefined;

      /*
       * Answer all five questions.
       */
      for (
        let position = 1;
        position <= 5;
        position++
      ) {
        const next =
          await request(app)
            .get(
              `/api/interviews/${interviewId}/next`
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .expect(200);

        expect(
          next.body.position
        ).toBe(position);

        finalResponse =
          await request(app)
            .post(
              `/api/interviews/${interviewId}/answers`
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              interviewQuestionId:
                next.body
                  .interviewQuestionId,

              response:
                `answer ${position}`
            })
            .expect(201);
      }

      /*
       * TypeScript cannot automatically prove
       * the loop assigned finalResponse,
       * so we explicitly guard against it.
       */
      if (!finalResponse) {
        throw new Error(
          "Final interview response was not created"
        );
      }

      expect(
        finalResponse.body.progress
      ).toEqual({
        answered: 5,
        total: 5
      });

      /*
       * The API should not immediately
       * mark the interview completed.
       *
       * It should wait for the async worker.
       */
      expect(
        finalResponse.body.status
      ).toBe("EVALUATING");

      expect(
        finalResponse.body
          .evaluationJobId
      ).toBe(
        `evaluation-${interviewId}`
      );

      /*
       * Verify PostgreSQL interview state.
       */
      const interview =
        await prisma.interview.findUnique({
          where: {
            id: interviewId
          }
        });

      expect(
        interview?.status
      ).toBe("EVALUATING");

      /*
       * Verify PostgreSQL evaluation state.
       */
      const evaluation =
        await prisma.evaluation.findUnique({
          where: {
            interviewId
          }
        });

      expect(
        evaluation?.status
      ).toBe("PENDING");
    }
  );
});