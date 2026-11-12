import { type Response, type Request } from "express";
import {
  getEntries,
  getAllEntries,
  upsertEntry,
  getRecords,
} from "./entry.service";
import { buildCreateEntrySchema } from "@habits/shared/entry";

export const handleGetAllEntries = async (req: Request, res: Response) => {
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;
  const habitId = req.query.habitId ? String(req.query.habitId) : undefined;

  const entries = await getAllEntries(req.userId, from, to, habitId);
  res.status(200).json({ entries });
};

export const handleGetEntries = async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;

  const entries = await getEntries(req.userId, String(habitId), from, to);
  res.status(200).json({ entries });
};

export const handleCreateEntry = async (req: Request, res: Response) => {
  const parsed = buildCreateEntrySchema(req.habit!.type).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed: body",
      issues: parsed.error.issues,
    });
  }

  const { entry: newEntry, updatedExisting } = await upsertEntry(
    req.userId,
    String(req.params.habitId),
    parsed.data,
  );

  res.status(updatedExisting ? 200 : 201).json({ newEntry });
};

export const handleGetRecords = async (req: Request, res: Response) => {
  const { habitId } = req.params;

  const records = await getRecords(req.userId, String(habitId));
  res.status(200).json({ records });
};
