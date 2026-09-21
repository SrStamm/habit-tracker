import { z } from "zod";

export enum HabitType {
  BOOLEAN = "BOOLEAN",
  QUANTITY = "QUANTITY",
  DURATION = "DURATION",
}

export const HabitSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    type: z.enum(HabitType),
  }),
});

export type HabitInput = z.infer<typeof HabitSchema>;
