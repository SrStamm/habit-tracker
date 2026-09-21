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

export const HabitUpdateSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    type: z.enum(HabitType).optional(),
  }),
  params: z.object({
    habitId: z.string(),
  }),
});

export const HabitDeleteSchema = z.object({
  params: z.object({
    habitId: z.string(),
  }),
});
