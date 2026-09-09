import express, { Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/authRoutes";
import questionRoutes from "./routes/questionRoutes";
import attemptRoutes from "./routes/attemptRoutes";

const openapi = require("./docs/openapi");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "interview-simulation-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attempts", attemptRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

export default app;