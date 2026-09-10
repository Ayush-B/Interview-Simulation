import { describe, expect, it } from "vitest";
import request from "supertest";

import app from "../app";

describe("GET /health", () => {
  it("returns API health status", async () => {
    const response = await request(app)
      .get("/health")
      .expect(200);

    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe(
      "interview-simulation-api"
    );
  });
});