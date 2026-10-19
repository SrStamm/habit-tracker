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

export type CreateGoalDTO = z.infer<typeof CreateGoalSchema>;
