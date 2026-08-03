import type { Request, Response, NextFunction } from "express";
import { redisClient } from "../lib/redis";
import { AppError } from "./error.middleware";

const BUCKET_LIMIT = 10;
const REFILL_RATE = 1;
const REFILL_INTERVAL = 6;

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ip = req.ip;
    const key = `ratelimit:${ip}`;
    const now = Math.floor(Date.now() / 1000);

    const data = await redisClient.hgetall(key);

    let token: number;
    let lastRefill: number;

    if (!data || !data.token) {
      token = BUCKET_LIMIT;
      lastRefill = now;
    } else {
      token = parseFloat(data.token ?? "0");
      lastRefill = parseFloat(data.lastRefill ?? `${now}`);

      const elapsed = now - lastRefill;
      const refilled = Math.floor(elapsed / REFILL_INTERVAL) + REFILL_RATE;

      if (refilled > 0) {
        token = Math.min(BUCKET_LIMIT, token + refilled);
        lastRefill = now;
      }
    }

    if (token < 1) {
      res.setHeader("X-RateLimit-Limit", BUCKET_LIMIT);
      res.setHeader("X-RateLimit-Remaining", 0);
      return next(new AppError("Too many requests. Slow down.", 429));
    }

    token -= 1;

    await redisClient.hset(key, {
        token: token.toString(),
        lastRefill: token.toString(),
    });

    await redisClient.expire(key, 60 * 60); 

    res.setHeader('X-RateLimit-Limit', BUCKET_LIMIT);
    res.setHeader('X-RateLimit-Remaining', Math.floor(token));

    next();
  } catch (err) {
    next();
  }
}
