import "dotenv/config";
import app from "./app";
import { prisma } from "./config/prisma";

const PORT = Number(process.env.PORT) || 4000;

async function start(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("PostgreSQL connected");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();