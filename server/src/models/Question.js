const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["SE", "DS"], required: true },
    type: { type: String, enum: ["technical", "generic"], required: true },
    question_text: { type: String, required: true },
    correct_answer: { type: String },
    explanation: { type: String }
  },
  { timestamps: true }
);

questionSchema.index({ role: 1, type: 1 });

module.exports = mongoose.model("Question", questionSchema);
