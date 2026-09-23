import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { EntrySchema, GetEntriesShemas } from "./entry.types";
import { handleCreateEntry, handleGetEntries } from "./entry.controller";

const entryRouter: Router = Router();
entryRouter.use(authMiddleware);

entryRouter.get(
  "/:habitId/entries",
  validate(GetEntriesShemas),
  handleGetEntries,
);

entryRouter.post("/:habitId/entries", validate(EntrySchema), handleCreateEntry);

export default entryRouter;
