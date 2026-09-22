import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { EntrySchema } from "./entry.types";
import { handleCreateEntry } from "./entry.controller";

const entryRouter: Router = Router();
entryRouter.use(authMiddleware);

entryRouter.post("/:habitId/entries", validate(EntrySchema), handleCreateEntry);

export default entryRouter;
