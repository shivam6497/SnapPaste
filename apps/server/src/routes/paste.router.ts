import { Router } from "express";
import {
    handleCreatePaste,
    handleGetPaste,
    handleDeletePaste,
    handleCheckPasteExists
} from "../controllers/paste.controller";
import { validate } from "../middleware/validate.middleware";
import { rateLimiter } from "../middleware/rateLimiter.middleware";
import { createPasteSchema } from "../lib/schema";

const router: Router = Router();

router.post('/', rateLimiter, validate(createPasteSchema), handleCreatePaste);
router.get('/:code', handleGetPaste);
router.delete('/:code', handleDeletePaste);
router.get('/:code/exists', handleCheckPasteExists);

export default router;