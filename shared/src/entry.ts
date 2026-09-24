import { z } from "zod";

export const CreateEntrySchema = z.object({
  value: z.number().optional(),
  completed: z.boolean(),
});
export type CreateEntryDTO = z.infer<typeof CreateEntrySchema>;

export const GetEntriesQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type GetEntriesQueryDTO = z.infer<typeof GetEntriesQuerySchema>;

export const EntryParamsSchema = z.object({
  habitId: z.string(),
});

export type Entry = CreateEntryDTO & {
  _id: string;
  userId: string;
  habitId: string;
  date: string;
};
