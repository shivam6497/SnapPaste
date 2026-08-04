import dotenv from "dotenv";
dotenv.config();

import express, { type Express } from "express";
import cors from "cors";
import pasteRouter from "./routes/paste.router";
import { errorMiddleware } from "./middleware/error.middleware";
import { scheduleCleanupJobs } from "./queues/cleanup.queue";
import { startCleanupWorker } from "./queues/cleanup.worker";

const app: Express = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-paste-password'],
}));
app.use(express.json({ limit: '500kb' }));

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/paste", pasteRouter);

app.use(errorMiddleware);

async function main() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  startCleanupWorker(),
  await scheduleCleanupJobs();
}

main();
