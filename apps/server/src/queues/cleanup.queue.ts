import { Queue } from "bullmq";
import { bullmqClient } from "../lib/redis";

export const cleanupQueue = new Queue('paste-cleanup', {
    connection: bullmqClient,
}) ;

export async function scheduleCleanupJobs() {
    const existingJobs = await cleanupQueue.getRepeatableJobs();
    const alreadyScheduleJobs = existingJobs.find(
        (job) => job.name === 'cleanup-expired'
    );

    if(!alreadyScheduleJobs) {
        await cleanupQueue.add(
            'cleanup-expired', 
            {},
            {
                repeat: { pattern: '*/15 * * * *' },
                jobId: 'cleanup-expired',
            }
        );

        console.log("Cleanup Job scheduled");
    }
}