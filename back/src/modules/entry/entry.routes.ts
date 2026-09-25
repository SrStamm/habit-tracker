import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { validateHabitOwner } from "../../middleware/validateHabitOwner";
import { GetEntriesQuerySchema, EntryParamsSchema } from "@habits/shared/entry";
import {
  handleCreateEntry,
  handleGetAllEntries,
  handleGetEntries,
} from "./entry.controller";

const entryRouter: Router = Router();
entryRouter.use(authMiddleware);

entryRouter.get(
  "/entries",
  validate({ query: GetEntriesQuerySchema }),
  handleGetAllEntries,
);

entryRouter.get(
  "/:habitId/entries",
  validate({ params: EntryParamsSchema, query: GetEntriesQuerySchema }),
  validateHabitOwner,
  handleGetEntries,
);

entryRouter.post(
  "/:habitId/entries",
  validate({ params: EntryParamsSchema }),
  validateHabitOwner,
  handleCreateEntry,
);

export default entryRouter;
