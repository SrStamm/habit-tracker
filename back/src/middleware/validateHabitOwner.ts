import { type Request, type Response, type NextFunction } from "express";
import Habit from "../models/Habit";

export const validateHabitOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const habit = await Habit.findOne({
      userId: req.userId,
      _id: req.params.habitId,
    });
    if (!habit) {
      return res.status(404).json({ error: "Hábito no encontrado" });
    }

    // Adiciona o Habit em Request
    req.habit = habit;

    next();
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
};
