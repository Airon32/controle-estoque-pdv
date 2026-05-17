import dotenv from "dotenv";

dotenv.config();

import { app } from "./app";
import { prisma } from "./config/db";

const port = Number(process.env.PORT) || 3333;

const startServer = async () => {
  try {
    await prisma.$connect();

    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
};

startServer();
