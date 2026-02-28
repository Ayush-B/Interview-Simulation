const openapi = {
  openapi: "3.0.0",
  info: {
    title: "Interview Simulation API",
    version: "1.0.0",
    description: "Backend API for Interview Simulation (Sprint 1 demo)"
  },
  servers: [
    { url: "http://localhost:4000", description: "Local server" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  tags: [
    { name: "Auth" },
    { name: "Questions" },
    { name: "Attempts" }
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "OK"
          }
        }
      }
    },

    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Signup (register a user)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "test1@example.com" },
                  password: { type: "string", example: "password123" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Bad request" },
          409: { description: "Email already in use" }
        }
      }
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "test1@example.com" },
                  password: { type: "string", example: "password123" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "OK" },
          400: { description: "Bad request" },
          401: { description: "Invalid credentials" }
        }
      }
    },

    "/api/questions/random": {
      get: {
        tags: ["Questions"],
        summary: "Get a random question",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "role",
            in: "query",
            required: true,
            schema: { type: "string", example: "SE" }
          },
          {
            name: "type",
            in: "query",
            required: true,
            schema: { type: "string", example: "technical" }
          }
        ],
        responses: {
          200: { description: "OK" },
          400: { description: "Missing params" },
          401: { description: "Unauthorized" },
          404: { description: "No questions found" }
        }
      }
    },

    "/api/attempts": {
      post: {
        tags: ["Attempts"],
        summary: "Submit an attempt",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["questionId", "userAnswer"],
                properties: {
                  questionId: { type: "string", example: "699e182177d851947d3fc517" },
                  userAnswer: { type: "string", example: "80" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Bad request" },
          401: { description: "Unauthorized" },
          404: { description: "Question not found" }
        }
      },
      get: {
        tags: ["Attempts"],
        summary: "Get attempt history for logged-in user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "OK" },
          401: { description: "Unauthorized" }
        }
      }
    }
  }
};

module.exports = openapi;
