import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { validateHabitOwner } from "../../middleware/validateHabitOwner";
import { EntrySchema, GetEntriesShemas } from "./entry.types";
import { handleCreateEntry, handleGetEntries } from "./entry.controller";

const entryRouter: Router = Router();
entryRouter.use(authMiddleware);

entryRouter.get(
  "/:habitId/entries",
  validate(GetEntriesShemas),
  validateHabitOwner,
  handleGetEntries,
);

entryRouter.post(
  "/:habitId/entries",
  validate(EntrySchema),
  validateHabitOwner,
  handleCreateEntry,
);

export default entryRouter;
