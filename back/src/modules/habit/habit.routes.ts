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
  CreateHabitSchema,
  HabitUpdateSchema,
  HabitDeleteSchema,
} from "@habits/shared/habit";

const habitRouter: Router = Router();
habitRouter.use(authMiddleware);

habitRouter.get("/", handleGetAllHabits);

habitRouter.post("/", validate({ body: CreateHabitSchema }), handleCreateHabit);

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
