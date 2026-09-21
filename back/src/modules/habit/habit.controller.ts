import { type Response, type Request } from "express";
import { findAllHabits } from "./habit.service";

export const handleGetAllHabits = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const allHabits = await findAllHabits(userId);
    return res.status(200).json({ allHabits });
  } catch (error) {
    return res.status(404).json({ error: (error as Error).message });
  }
};
