import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = new Redis(process.env.REDIS_HOST as string, {
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 5) {
      console.error("Redis connection failed after 5 attempts.");
      return null;
    }
    const delay = Math.min(times * 200, 1000);
    return delay;
  },
});

redisClient.on("connect", () => {
  console.log("Connected to Redis server.");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export const bullmqClient = new Redis(process.env.REDIS_HOST as string, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    return Math.min(times * 200, 2000);
  },
});

bullmqClient.on("connect", () => {
  console.log("Connected to BullMQ Redis server.");
});

bullmqClient.on("error", (err) => {
  console.error("BullMQ Redis connection error:", err);
});
