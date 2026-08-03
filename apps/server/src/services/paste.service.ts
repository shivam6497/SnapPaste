import { prisma } from "../lib/prisma";
import { redisClient } from "../lib/redis";
import { customAlphabet } from "nanoid";
import bcrypt from "bcrypt";
import { CreatePasteRequest } from "@snappaste/types";

const generateCode = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  7,
);

const CACHE_PREFIX = "paste:";
const BURN_PREFIX = "burn:";

function getExpiresAt(expiresIn?: string): Date | null {
  if (!expiresIn || expiresIn === "never") return null;

  const map: Record<string, number> = {
    "1h": 60 * 60,
    "24h": 24 * 60 * 60,
    "7d": 7 * 24 * 60 * 60,
  };

  const seconds = map[expiresIn];
  if (!seconds) return null;

  return new Date(Date.now() + seconds * 1000);
}

function getTTLSeconds(expiresAt: Date | null): number | null {
  if (!expiresAt) return null;

  const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  return ttl > 0 ? ttl : null;
}

export async function createPaste(data: CreatePasteRequest) {
  const expiresAt = getExpiresAt(data.expiresIn);
  const hashedPassword = data.password
    ? await bcrypt.hash(data.password, 10)
    : null;

  let code = "";
  let attempts = 0;
  while (attempts < 3) {
    const candidateCode = generateCode();
    const existing = await prisma.paste.findUnique({
      where: { code: candidateCode },
    });
    if (!existing) {
      code = candidateCode;
      break;
    }
    attempts++;
  }

  if (!code) throw new Error("Failed to generate a unique code for the paste.");

  const paste = await prisma.paste.create({
    data: {
      code,
      title: data.title,
      content: data.content,
      language: data.language,
      expiresAt,
      burnAfterRead: data.burnAfterRead || false,
      password: hashedPassword,
    },
  });

  const ttl = getTTLSeconds(expiresAt);
  const cacheKey = `${CACHE_PREFIX}${code}`;
  const cacheData = JSON.stringify(paste);

  if (ttl) {
    await redisClient.set(cacheKey, cacheData, "EX", ttl);
  } else {
    await redisClient.set(cacheKey, cacheData);
  }

  if (paste.burnAfterRead) {
    const burnkey = `${BURN_PREFIX}${code}`;
    if (ttl) {
      await redisClient.set(burnkey, "1", "EX", ttl);
    } else {
      await redisClient.set(burnkey, "1");
    }
  }

  return { code, url: `/p/${code}` };
}

export async function getPaste(code: string, password?: string) {
  const cacheKey = `${CACHE_PREFIX}${code}`;
  const burnKey = `${BURN_PREFIX}${code}`;

  let paste: any;
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    paste = JSON.parse(cachedData);
  } else {
    paste = await prisma.paste.findUnique({ where: { code } });
    if (!paste) return null;

    const ttl = getTTLSeconds(paste.expiresAt);
    const cacheValue = JSON.stringify(paste);
    if (ttl) {
      redisClient.set(cacheKey, cacheValue, "EX", ttl);
    } else {
      redisClient.set(cacheKey, cacheValue);
    }

    if (paste.burnAfterRead) {
      if (ttl) {
        redisClient.set(burnKey, "1", "EX", ttl);
      } else {
        redisClient.set(burnKey, "1");
      }
    }
  }

  if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
    await redisClient.del(cacheKey, burnKey);
    return null;
  }

  if (paste.password) {
    if (!password) {
      throw new Error("Password is required to access this paste.");
    }

    const attempKey = `attempts:${code}`;
    const attempts = await redisClient.get(attempKey);

    if (attempts && parseInt(attempts) >= 5) {
      throw new Error("TOO_MANY_ATTEMPTS");
    }

    const match = await bcrypt.compare(password, paste.password);

    if(!match) {
        await redisClient.multi()
           .incr(attempKey)
           .expire(attempKey, 60 * 15)
           .exec();
        throw new Error('Incorrect password.');
    }

    await redisClient.del(attempKey);
  }

  const isBurn = await redisClient.get(burnKey);
  if (isBurn) {
    await redisClient.del(cacheKey, burnKey);
    await prisma.paste.delete({ where: { code } });
  }

  const { password: _, ...safePaste } = paste;
  return safePaste;
}

export async function deletePaste(code: string) {
  const cacheKey = `${CACHE_PREFIX}${code}`;
  const burnKey = `${BURN_PREFIX}${code}`;

  await redisClient.del(cacheKey, burnKey);
  await prisma.paste.delete({ where: { code } });
}

export async function checkPasteExists(code: string) {
  const cacheKey = `${CACHE_PREFIX}${code}`;
  const cachedData = await redisClient.get(cacheKey);

  if (!cachedData)
    return { exists: false, passwordProtected: false, burnAfterRead: false };

  const paste = JSON.parse(cachedData);
  return {
    exists: true,
    passwordProtected: !!paste.password,
    burnAfterRead: !!paste.burnAfterRead,
  };
}
