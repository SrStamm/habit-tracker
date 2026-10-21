import { HabitType } from "@habits/shared/habit";

export const goalAmountUnitLabel = (type: HabitType, unit?: string): string => {
  if (type === HabitType.BOOLEAN) return "dias";
  if (type === HabitType.DURATION) return "Minutos";
  return unit ?? "";
};
