import { type Request, type Response } from "express";
import {
  getGoals,
  createGoal,
  deleteGoal,
  getGoalProgress,
} from "./goal.service";
import { HttpError } from "../../lib/errors";

export const handleGetGoals = async (req: Request, res: Response) => {
  try {
    const goals = await getGoals(req.userId, String(req.params.habitId));
    return res.status(200).json({ goals });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const handleGetGoalProgress = async (req: Request, res: Response) => {
  try {
    const progress = await getGoalProgress(
      req.userId,
      String(req.params.habitId),
      String(req.params.goalId),
      req.habit!,
    );
    return res.status(200).json(progress);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const handleCreateGoal = async (req: Request, res: Response) => {
  try {
    const saved = await createGoal(
      req.userId,
      String(req.params.habitId),
      req.body,
    );

    res.status(201).json(saved);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const handleDeleteGoal = async (req: Request, res: Response) => {
  try {
    await deleteGoal(
      req.userId,
      String(req.params.habitId),
      String(req.params.goalId),
    );

    return res.status(204).send();
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
