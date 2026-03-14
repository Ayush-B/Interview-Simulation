const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

const questionRoutes = require("./routes/questionRoutes");
const authRoutes = require("./routes/authRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./docs/openapi");

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

module.exports = app;
