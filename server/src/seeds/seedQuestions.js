require("dotenv").config();
const { connectDB } = require("../config/db");
const Question = require("../models/Question");

const questions = [
  {
    role: "SE",
    type: "technical",
    question_text: "What does HTTP status code 404 mean?",
    correct_answer: "Not Found",
    explanation: "404 indicates the server cannot find the requested resource."
  },
  {
    role: "SE",
    type: "technical",
    question_text: "In Big-O notation, what is the average time complexity of binary search?",
    correct_answer: "O(log n)",
    explanation: "Binary search halves the search space each step."
  },
  {
    role: "SE",
    type: "technical",
    question_text: "What is the purpose of middleware in Express?",
    correct_answer: "To process requests and responses in the request lifecycle",
    explanation: "Middleware functions run between request and response handling."
  },
  {
    role: "SE",
    type: "technical",
    question_text: "What is the default port for HTTP?",
    correct_answer: "80",
    explanation: "HTTP defaults to port 80, HTTPS defaults to 443."
  },
  {
    role: "SE",
    type: "technical",
    question_text: "What is the output type of JSON.parse?",
    correct_answer: "Object",
    explanation: "JSON.parse converts a JSON string into a JavaScript object."
  },
  {
    role: "SE",
    type: "technical",
    question_text: "What is a primary key used for in a database?",
    correct_answer: "To uniquely identify a record",
    explanation: "A primary key uniquely identifies each row in a table."
  },
  {
    role: "SE",
    type: "technical",
    question_text: "What does REST stand for?",
    correct_answer: "Representational State Transfer",
    explanation: "REST is an architectural style for networked applications."
  },
  {
    role: "SE",
    type: "technical",
    question_text: "What is the main advantage of using HTTPS over HTTP?",
    correct_answer: "Encryption",
    explanation: "HTTPS encrypts traffic using TLS."
  }
];

async function run() {
  await connectDB();

  // idempotent: reset SE technical set for demo consistency
  await Question.deleteMany({ role: "SE", type: "technical" });
  await Question.insertMany(questions);

  console.log("Seeded questions:", questions.length);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
