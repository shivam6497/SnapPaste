import type { NextFunction, Request, Response } from "express";
import {
  createPaste,
  getPaste,
  deletePaste,
  checkPasteExists,
} from "../services/paste.service";
import { AppError } from "../middleware/error.middleware";

export async function handleCreatePaste(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, content, language, expiresIn, burnAfterRead, password } =
      req.body;

    if (!content) {
      throw new AppError("Content is required", 400);
    }

    const result = await createPaste({
      title,
      content,
      language,
      expiresIn,
      burnAfterRead,
      password,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetPaste(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params;
    if (!code) {
      throw new AppError("Code is required", 400);
    }
    const password = req.headers["x-paste-password"] as string | undefined;

    const paste = await getPaste(code, password || "");

    if (!paste) {
      throw new AppError("Paste not found", 404);
    }

    res.json(paste);
  } catch (err: any) {
    if (err.message === "Password is required to access this paste.") {
      return next(new AppError("Password required", 401));
    }
    if (err.message === "Incorrect password.") {
      return next(new AppError("Invalid password", 403));
    }
    if (err.message === "TOO_MANY_ATTEMPTS") {
      return next(
        new AppError("Too many failed attempts. Try again in 15 minutes.", 429),
      );
    }
    next(err);
  }
}

export async function handleDeletePaste(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params;
    if (!code) {
      throw new AppError("Code is required", 400);
    }

    await deletePaste(code);

    res.status(204).json({ message: "Paste deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function handleCheckPasteExists(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params;
    if (!code) {
      throw new AppError("Code is required", 400);
    }

    const exists = await checkPasteExists(code);

    res.json(exists);
  } catch (error) {
    next(error);
  }
}
