import { z } from "zod";

export const EntrySchema = z.object({
  body: z.object({
    value: z.number(),
    completed: z.boolean(),
  }),
  params: z.object({
    habitId: z.string(),
  }),
});

export const GetEntriesShemas = z.object({
  params: z.object({
    habitId: z.string(),
  }),
  query: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});
