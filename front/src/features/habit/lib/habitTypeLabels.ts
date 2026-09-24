import { HabitType } from "@habits/shared/habit";

export const HABIT_TYPE_LABELS: Record<HabitType, string> = {
  [HabitType.BOOLEAN]: "Sim/Não",
  [HabitType.QUANTITY]: "Quantidade",
  [HabitType.DURATION]: "Duração",
};