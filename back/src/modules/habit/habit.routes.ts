import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { validateHabitOwner } from "../../middleware/validateHabitOwner";
import {
  handleGetAllHabits,
  handleCreateHabit,
  handleUpdateHabit,
  handleArchiveHabit,
} from "./habit.controller";
import {
  CreateHabitSchema,
  HabitUpdateSchema,
  HabitParamsSchema,
  QueryGetHabits,
} from "@habits/shared/habit";

const habitRouter: Router = Router();
habitRouter.use(authMiddleware);

habitRouter.get("/", validate({ query: QueryGetHabits }), handleGetAllHabits);

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
  handleArchiveHabit,
);

export const habitRoutes = { basePath: "/habits", router: habitRouter };
