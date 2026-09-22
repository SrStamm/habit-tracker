import { type Response, type Request } from "express";
import { validateUserHabit, createEntry } from "./entry.service";

export const handleCreateEntry = async (req: Request, res: Response) => {
  const { value, completed } = req.body;
  const habitId = req.params.habitId;
  const userId = req.userId;

  try {
    await validateUserHabit(userId, habitId);
    const newEntry = await createEntry(userId, habitId, value, completed);
    res.status(201).json({ newEntry });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
};
