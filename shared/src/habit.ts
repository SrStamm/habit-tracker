import { z } from "zod";

export enum HabitType {
  BOOLEAN = "BOOLEAN",
  QUANTITY = "QUANTITY",
  DURATION = "DURATION",
}

export const CreateHabitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(HabitType),
});

export type CreateHabitDTO = z.infer<typeof CreateHabitSchema>;

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

export type UpdateHabitDTO = z.infer<typeof HabitUpdateSchema>;

export const HabitDeleteSchema = z.object({
  habitId: z.string(),
});

export type DeleteHabitDTO = z.infer<typeof HabitDeleteSchema>;

export type Habit = CreateHabitDTO & {
  _id: string;
  userId: string;
};
