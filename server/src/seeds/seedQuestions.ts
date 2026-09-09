import { prisma } from "../config/prisma";

const questions = [
  {
    role: "SE",
    type: "technical",
    prompt: "What does HTTP status code 404 mean?",
    correctAnswer: "Not Found",
    explanation: "404 indicates the server cannot find the requested resource."
  },
  {
    role: "SE",
    type: "technical",
    prompt: "In Big-O notation, what is the average time complexity of binary search?",
    correctAnswer: "O(log n)",
    explanation: "Binary search halves the search space each step."
  },
  {
    role: "SE",
    type: "technical",
    prompt: "What is the purpose of middleware in Express?",
    correctAnswer: "To process requests and responses in the request lifecycle",
    explanation: "Middleware functions run between request and response handling."
  },
  {
    role: "SE",
    type: "technical",
    prompt: "What is the default port for HTTP?",
    correctAnswer: "80",
    explanation: "HTTP defaults to port 80, HTTPS defaults to 443."
  },
  {
    role: "SE",
    type: "technical",
    prompt: "What is the output type of JSON.parse?",
    correctAnswer: "Object",
    explanation: "JSON.parse converts a JSON string into a JavaScript object."
  },
  {
    role: "SE",
    type: "technical",
    prompt: "What is a primary key used for in a database?",
    correctAnswer: "To uniquely identify a record",
    explanation: "A primary key uniquely identifies each row in a table."
  },
  {
    role: "SE",
    type: "technical",
    prompt: "What does REST stand for?",
    correctAnswer: "Representational State Transfer",
    explanation: "REST is an architectural style for networked applications."
  },
  {
    role: "SE",
    type: "technical",
    prompt: "What is the main advantage of using HTTPS over HTTP?",
    correctAnswer: "Encryption",
    explanation: "HTTPS encrypts traffic using TLS."
  }
];

async function run(): Promise<void> {
  for (const question of questions) {
    const existing = await prisma.question.findFirst({
      where: {
        role: question.role,
        type: question.type,
        prompt: question.prompt
      }
    });

    if (existing) {
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          isActive: true
        }
      });
    } else {
      await prisma.question.create({
        data: question
      });
    }
  }

  console.log(`Seeded questions: ${questions.length}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });