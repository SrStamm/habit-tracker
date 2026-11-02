import { Entry } from "@habits/shared/entry";
import { Habit, HabitType } from "@habits/shared/habit";

export const isCompleted = (
  habit: Habit,
  entry: Entry | undefined,
): boolean => {
  if (!entry) return false;
  if (habit.type === HabitType.BOOLEAN) return entry.completed === true;
  if (habit.type === HabitType.WORKOUT) {
    return (entry.workout?.length ?? 0) > 0;
  }

  const value = entry.value ?? 0;
  if (habit.target == null) return value > 0;
  return value >= habit.target;
};
