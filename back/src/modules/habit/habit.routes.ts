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
  HabitParamsSchema,
} from "@habits/shared/habit";

const habitRouter: Router = Router();
habitRouter.use(authMiddleware);

habitRouter.get("/", handleGetAllHabits);

habitRouter.post("/", validate({ body: CreateHabitSchema }), handleCreateHabit);

habitRouter.patch(
  "/:habitId",
  validate({ body: HabitUpdateSchema, params: HabitParamsSchema }),
  validateHabitOwner,
  handleUpdateHabit,
);

habitRouter.delete(
  "/:habitId",
  validate({ params: HabitParamsSchema }),
  validateHabitOwner,
  handleDeleteHabit,
);

export default habitRouter;
