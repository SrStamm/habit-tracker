import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { handleGetAllHabits, handleCreateHabit } from "./habit.controller";
import { HabitSchema } from "./habit.types";

const habitRouter: Router = Router();
habitRouter.use(authMiddleware);

habitRouter.get("/", handleGetAllHabits);

habitRouter.post("/", validate(HabitSchema), handleCreateHabit);

export default habitRouter;
