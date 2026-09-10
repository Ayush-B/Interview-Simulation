import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from "vitest";

import request from "supertest";

import app from "../app";
import { prisma } from "../config/prisma";

const testEmail = "auth-integration-test@example.com";
const testPassword = "Password123!";

describe("Authentication integration", () => {
  beforeAll(async () => {
    // Create one question so we can test an authenticated protected route.
    await prisma.question.deleteMany({
      where: {
        role: "TEST",
        type: "technical"
      }
    });

    await prisma.question.create({
      data: {
        role: "TEST",
        type: "technical",
        prompt: "What does API stand for?",
        correctAnswer: "Application Programming Interface",
        explanation: "API stands for Application Programming Interface."
      }
    });
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: testEmail
      }
    });
  });

  afterAll(async () => {
    await prisma.question.deleteMany({
      where: {
        role: "TEST",
        type: "technical"
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: testEmail
      }
    });

    await prisma.$disconnect();
  });

  it("creates a new user and returns a JWT", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        email: testEmail,
        password: testPassword
      })
      .expect(201);

    expect(response.body.token).toBeTruthy();

    expect(response.body.user.email).toBe(
      testEmail
    );

    const user = await prisma.user.findUnique({
      where: {
        email: testEmail
      }
    });

    expect(user).not.toBeNull();

    // Password should never be stored as plaintext.
    expect(user?.passwordHash).not.toBe(
      testPassword
    );
  });

  it("rejects duplicate signup", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({
        email: testEmail,
        password: testPassword
      })
      .expect(201);

    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        email: testEmail,
        password: testPassword
      })
      .expect(409);

    expect(response.body.error).toBe(
      "email already in use"
    );
  });

  it("logs in with valid credentials", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({
        email: testEmail,
        password: testPassword
      })
      .expect(201);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: testPassword
      })
      .expect(200);

    expect(response.body.token).toBeTruthy();
    expect(response.body.user.email).toBe(
      testEmail
    );
  });

  it("rejects an incorrect password", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({
        email: testEmail,
        password: testPassword
      })
      .expect(201);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "WrongPassword123!"
      })
      .expect(401);

    expect(response.body.error).toBe(
      "invalid credentials"
    );
  });

  it("rejects access to a protected route without JWT", async () => {
    const response = await request(app)
      .get(
        "/api/questions/random?role=TEST&type=technical"
      )
      .expect(401);

    expect(response.body.error).toBe(
      "Missing or invalid Authorization header"
    );
  });

  it("allows access to a protected route with a valid JWT", async () => {
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({
        email: testEmail,
        password: testPassword
      })
      .expect(201);

    const token = signup.body.token;

    const response = await request(app)
      .get(
        "/api/questions/random?role=TEST&type=technical"
      )
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .expect(200);

    expect(response.body.id).toBeTruthy();

    expect(response.body.question_text).toBe(
      "What does API stand for?"
    );
  });
});