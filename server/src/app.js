const express = require("express");
const cors = require("cors");

const questionRoutes = require("./routes/questionRoutes");
const authRoutes = require("./routes/authRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./docs/openapi");
const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

module.exports = app;
