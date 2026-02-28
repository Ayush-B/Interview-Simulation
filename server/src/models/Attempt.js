const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    questionText: { type: String, required: true },  // snapshot for history display
    userAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    correctAnswer: { type: String }
  },
  { timestamps: true }
);

attemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Attempt", attemptSchema);
