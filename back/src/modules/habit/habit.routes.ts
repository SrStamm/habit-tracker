import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { validateHabitOwner } from "../../middleware/validateHabitOwner";
import {
  handleGetAllHabits,
  handleCreateHabit,
  handleUpdateHabit,
  handleDeleteHabit,
} from "./habit.controller";
import {
  HabitSchema,
  HabitUpdateSchema,
  HabitDeleteSchema,
} from "./habit.types";

const habitRouter: Router = Router();
habitRouter.use(authMiddleware);

habitRouter.get("/", handleGetAllHabits);

habitRouter.post("/", validate(HabitSchema), handleCreateHabit);

habitRouter.patch(
  "/:habitId",
  validate(HabitUpdateSchema),
  validateHabitOwner,
  handleUpdateHabit,
);

habitRouter.delete(
  "/:habitId",
  validate(HabitDeleteSchema),
  validateHabitOwner,
  handleDeleteHabit,
);

export default habitRouter;
