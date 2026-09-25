import { z } from "zod";
import { HabitType } from "./habit";

const base = { at: z.iso.datetime().optional() };

export const buildCreateEntrySchema = (type: HabitType) =>
  type === HabitType.BOOLEAN
    ? z.object({ ...base, completed: z.boolean() }).strict()
    : z.object({ ...base, value: z.number().min(0) }).strict();

export type CreateEntryDTO = z.infer<ReturnType<typeof buildCreateEntrySchema>>;

export const GetEntriesQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type GetEntriesQueryDTO = z.infer<typeof GetEntriesQuerySchema>;

export const EntryParamsSchema = z.object({
  habitId: z.string(),
});

export type Entry = {
  _id: string;
  userId: string;
  habitId: string;
  dayKey: string;
  value?: number;
  completed?: boolean;
};
