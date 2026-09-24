import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { validateHabitOwner } from "../../middleware/validateHabitOwner";
import {
  CreateEntrySchema,
  GetEntriesQuerySchema,
  EntryParamsSchema,
} from "@habits/shared/entry";
import { handleCreateEntry, handleGetEntries } from "./entry.controller";

const entryRouter: Router = Router();
entryRouter.use(authMiddleware);

entryRouter.get(
  "/:habitId/entries",
  validate({ params: EntryParamsSchema, query: GetEntriesQuerySchema }),
  validateHabitOwner,
  handleGetEntries,
);

entryRouter.post(
  "/:habitId/entries",
  validate({ params: EntryParamsSchema, body: CreateEntrySchema }),
  validateHabitOwner,
  handleCreateEntry,
);

export default entryRouter;