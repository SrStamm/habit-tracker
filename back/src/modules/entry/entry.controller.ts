import { type Response, type Request } from "express";
import { createEntry, getEntries, getAllEntries } from "./entry.service";
import { buildCreateEntrySchema } from "@habits/shared/entry";

export const handleGetAllEntries = async (req: Request, res: Response) => {
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;

  try {
    const entries = await getAllEntries(req.userId, from, to);
    res.status(200).json({ entries });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const handleGetEntries = async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;

  try {
    const entries = await getEntries(req.userId, String(habitId), from, to);
    res.status(200).json({ entries });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const handleCreateEntry = async (req: Request, res: Response) => {
  const parsed = buildCreateEntrySchema(req.habit!.type).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed: body",
      issues: parsed.error.issues,
    });
  }

  const data = parsed.data;
  const value = "value" in data ? data.value : undefined;
  const completed = "completed" in data ? data.completed : undefined;

  try {
    const newEntry = await createEntry(
      req.userId,
      String(req.params.habitId),
      value,
      completed,
    );
    res.status(201).json({ newEntry });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
};
