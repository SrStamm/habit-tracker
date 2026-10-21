import { HabitType } from "@habits/shared/habit";

export const HABIT_TYPE_LABELS: Record<HabitType, string> = {
  [HabitType.BOOLEAN]: "Sim/Não",
  [HabitType.QUANTITY]: "Quantidade",
  [HabitType.DURATION]: "Duração",
};

export const HABIT_TYPE_BADGE_CLASSES: Record<HabitType, string> = {
  [HabitType.BOOLEAN]: "bg-blue-50 text-blue-700 border border-blue-200",
  [HabitType.QUANTITY]: "bg-violet-50 text-violet-700 border border-violet-200",
  [HabitType.DURATION]: "bg-amber-50 text-amber-700 border border-amber-200",
};
