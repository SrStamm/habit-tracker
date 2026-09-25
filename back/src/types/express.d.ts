import { Habit } from "@habits/shared/habit";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      habit?: NonNullable<Awaited<ReturnType<typeof Habit.findOne>>>;
    }
  }
}
