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
