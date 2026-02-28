const Attempt = require("../models/Attempt");
const Question = require("../models/Question");

function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

async function submitAttempt(req, res, next) {
  try {
    const { questionId, userAnswer } = req.body || {};
    if (!questionId || !userAnswer) {
      return res.status(400).json({ error: "questionId and userAnswer are required" });
    }

    const q = await Question.findById(questionId);
    if (!q) return res.status(404).json({ error: "question not found" });

    const expected = q.correct_answer || "";
    const isCorrect = normalize(userAnswer) === normalize(expected);

    const attempt = await Attempt.create({
      userId: req.userId,
      questionId: q._id,
      questionText: q.question_text,
      userAnswer,
      isCorrect,
      correctAnswer: expected
    });

    return res.status(201).json({
      attemptId: attempt._id,
      isCorrect,
      correctAnswer: expected,
      createdAt: attempt.createdAt
    });
  } catch (err) {
    next(err);
  }
}

async function getAttempts(req, res, next) {
  try {
    const attempts = await Attempt.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("questionText userAnswer isCorrect correctAnswer createdAt");

    return res.json(attempts);
  } catch (err) {
    next(err);
  }
}

module.exports = { submitAttempt, getAttempts };
