import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { validateHabitOwner } from "../../middleware/validateHabitOwner";
import {
  ParamsGoalsSchema,
  GetGoalsProgressSchema,
  CreateGoalSchema,
} from "@habits/shared/goal";
import {
  handleGetGoals,
  handleCreateGoal,
  handleDeleteGoal,
} from "./goal.controller";

const goalRouter: Router = Router();
goalRouter.use(authMiddleware);

goalRouter.get(
  "/:habitId/goals",
  validate({ params: ParamsGoalsSchema }),
  validateHabitOwner,
  handleGetGoals,
);

// goalRouter.get("/:habitId/goals/:goalId/progress", validate({ params: GetGoalsProgressSchema }), validateHabitOwner);

goalRouter.post(
  "/:habitId/goals",
  validate({ body: CreateGoalSchema, params: ParamsGoalsSchema }),
  validateHabitOwner,
  handleCreateGoal,
);

goalRouter.delete(
  "/:habitId/goals/:goalId",
  validate({ params: GetGoalsProgressSchema }),
  validateHabitOwner,
  handleDeleteGoal,
);

export const goalRoutes = { basePath: "/habits", router: goalRouter };
