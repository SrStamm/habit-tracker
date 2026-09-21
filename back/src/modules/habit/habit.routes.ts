import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import {
  handleGetAllHabits,
  handleCreateHabit,
  handleUpdateHabit,
} from "./habit.controller";
import { HabitSchema, HabitUpdateSchema } from "./habit.types";

const habitRouter: Router = Router();
habitRouter.use(authMiddleware);

habitRouter.get("/", handleGetAllHabits);

habitRouter.post("/", validate(HabitSchema), handleCreateHabit);

habitRouter.patch("/:habitId", validate(HabitUpdateSchema), handleUpdateHabit);

export default habitRouter;
