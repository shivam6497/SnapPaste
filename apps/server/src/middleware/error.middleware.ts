import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export function errorMiddleware (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if(err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
        return;
    }

    console.log(err);
    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}