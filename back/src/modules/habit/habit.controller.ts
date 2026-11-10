import { type Response, type Request } from "express";
import {
  findAllHabits,
  createHabit,
  updateHabit,
  archiveHabit,
  findAllActiveHabits,
} from "./habit.service";

export const handleGetAllHabits = async (req: Request, res: Response) => {
  const userId = req.userId;

  const rawAll = (req.query as { all?: string | string[] }).all;
  const wantAll = rawAll === "true";

  const allHabits = wantAll
    ? await findAllHabits(userId)
    : await findAllActiveHabits(userId);

  return res.status(200).json({ allHabits });
};

export const handleCreateHabit = async (req: Request, res: Response) => {
  const { name, description, category, type, target, unit } = req.body;
  const novoHabito = await createHabit(req.userId, {
    name,
    description,
    category,
    type,
    target,
    unit,
  });
  return res.status(201).json({ novoHabito });
};

export const handleUpdateHabit = async (
  req: Request<{ habitId: string }>,
  res: Response,
) => {
  const { name, description, category, type, target, unit } = req.body;
  const { habitId } = req.params;
  const userId = req.userId;

  const habitoAtualizado = await updateHabit(habitId, userId, {
    name,
    description,
    category,
    type,
    target,
    unit,
  });

  return res.status(201).json({ habitoAtualizado });
};

export const handleArchiveHabit = async (
  req: Request<{ habitId: string }>,
  res: Response,
) => {
  const userId = req.userId;
  const { habitId } = req.params;

  await archiveHabit(habitId, userId);
  return res.status(204).send();
};
