import { type Response, type Request } from "express";
import { findAllHabits, createHabit } from "./habit.service";

export const handleGetAllHabits = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const allHabits = await findAllHabits(userId);
    return res.status(200).json({ allHabits });
  } catch (error) {
    return res.status(404).json({ error: (error as Error).message });
  }
};

export const handleCreateHabit = async (req: Request, res: Response) => {
  const { name, description, category, type } = req.body;
  try {
    const novoHabito = await createHabit(
      req.userId,
      name,
      type,
      description,
      category,
    );
    return res.status(201).json({ novoHabito });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
};
