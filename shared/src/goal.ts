import { z } from "zod";

export enum GoalPeriod {
  WEEK = "WEEK",
  MONTH = "MONTH",
}

export const CreateGoalSchema = z
  .object({
    amount: z.number().min(1),
    period: z.enum(GoalPeriod),
  })
  .strict();

export const ParamsGoalsSchema = z
  .object({
    habitId: z.string().min(1),
  })
  .strict();

export type CreateGoalDTO = z.infer<typeof CreateGoalSchema>;

export const GetGoalsProgressSchema = z
  .object({
    habitId: z.string().min(1),
    goalId: z.string().min(1),
  })
  .strict();

export const GoalResponseSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  habitId: z.string(),
  amount: z.number(),
  period: z.enum(GoalPeriod),
});

export type GoalResponseDTO = z.infer<typeof GoalResponseSchema>;
