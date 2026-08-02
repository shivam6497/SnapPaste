import { z } from "zod";

export const createPasteSchema = z.object({
    title: z.string().max(100).optional(),
    content: z.string().min(1, "Cannot be Empty"),
    language: z.string().max(50).optional(),
    expiresIn: z.enum(['1h', '24h', '7d', 'never']).optional(),
    burnAfterRead: z.boolean().optional(),
    password: z.string().min(4).max(50).optional(),
});