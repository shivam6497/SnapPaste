import { Worker } from "bullmq";
import { bullmqClient } from "../lib/redis";
import { prisma } from "../lib/prisma";

export function startCleanupWorker() {
  const worker = new Worker(
    "paste-cleanup",
    async (job) => {
      console.log(`[Cleanup] Running at ${new Date().toISOString()}`);

      const deleted = await prisma.paste.deleteMany({
        where: {
          expiresAt: {
            lte: new Date(),
          },
        },
      });

      console.log(`[Cleanup] Deleted ${deleted.count} expired pastes`);
    },
    {
      connection: bullmqClient,
      concurrency: 5,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`[Cleanup] Job failed:`, err);
  });

  return worker;
}
