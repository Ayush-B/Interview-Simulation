import "dotenv/config";
import app from "./app";

const { connectDB } = require("./config/db");

const PORT = Number(process.env.PORT) || 4000;

async function start(): Promise<void> {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();