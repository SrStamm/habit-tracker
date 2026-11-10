import { type Request, type Response, type NextFunction } from "express";
import Habit from "../models/Habit";
import { HttpError } from "../lib/errors";

export const validateHabitOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const habit = await Habit.findOne({
    userId: req.userId,
    _id: req.params.habitId,
  });

  if (!habit) {
    throw new HttpError("Hábito no encontrado", 404);
  }

  // Adiciona o Habit em Request
  req.habit = habit;

  next();
};
