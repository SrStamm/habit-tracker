import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { validateHabitOwner } from "../../middleware/validateHabitOwner";
import { GetEntriesQuerySchema } from "@habits/shared/entry";
import { HabitParamsSchema as EntryParamsSchema } from "@habits/shared/habit";
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
