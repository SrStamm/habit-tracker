import { type Request, type Response } from "express";
import {
  getGoals,
  createGoal,
  deleteGoal,
  getGoalProgress,
} from "./goal.service";

export const handleGetGoals = async (req: Request, res: Response) => {
  const goals = await getGoals(req.userId, String(req.params.habitId));
  return res.status(200).json({ goals });
};

export const handleGetGoalProgress = async (req: Request, res: Response) => {
  const progress = await getGoalProgress(
    req.userId,
    String(req.params.habitId),
    String(req.params.goalId),
    req.habit!,
  );
  return res.status(200).json(progress);
};

export const handleCreateGoal = async (req: Request, res: Response) => {
  const saved = await createGoal(
    req.userId,
    String(req.params.habitId),
    req.body,
  );

  res.status(201).json(saved);
};

export const handleDeleteGoal = async (req: Request, res: Response) => {
  await deleteGoal(
    req.userId,
    String(req.params.habitId),
    String(req.params.goalId),
  );

  return res.status(204).send();
};
