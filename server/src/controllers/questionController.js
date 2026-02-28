const Question = require("../models/Question");

async function getRandomQuestion(req, res, next) {
  try {
    const role = String(req.query.role || "").toUpperCase();
    const type = String(req.query.type || "").toLowerCase();

    if (!role || !type) {
      return res.status(400).json({ error: "role and type query params are required" });
    }

    const filter = { role, type };
    const count = await Question.countDocuments(filter);

    if (count === 0) {
      return res.status(404).json({ error: "no questions found" });
    }

    const rand = Math.floor(Math.random() * count);
    const q = await Question.findOne(filter).skip(rand).select("question_text");

    return res.json({ id: q._id, question_text: q.question_text });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRandomQuestion };
