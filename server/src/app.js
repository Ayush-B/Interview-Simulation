const express = require("express");
const cors = require("cors");

const questionRoutes = require("./routes/questionRoutes");
const authRoutes = require("./routes/authRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attempts", attemptRoutes);

const { requireAuth } = require("./middleware/auth");

app.get("/protected", requireAuth, (req, res) => {
  res.json({ ok: true, userId: req.userId });
});

console.log("Mounted /api/auth routes");

module.exports = app;
