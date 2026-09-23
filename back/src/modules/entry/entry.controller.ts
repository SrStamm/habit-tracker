import { type Response, type Request } from "express";
import { validateUserHabit, createEntry, getEntries } from "./entry.service";

export const handleGetEntries = async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;

  try {
    await validateUserHabit(req.userId, habitId);
    const entries = await getEntries(req.userId, habitId, from, to);
    res.status(200).json({ entries });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
};

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
