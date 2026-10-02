import { Entry } from "@habits/shared/entry";
import { Habit, HabitType } from "@habits/shared/habit";

export const isCompleted = (habit: Habit, entry: Entry | undefined) => {
  if (!entry) return false;

  // Se é BOOLEAN, valida 'completed'
  if (habit.type === HabitType.BOOLEAN) {
    if (entry.completed) return true;
    return false;
  }

  // Se não tem 'target', e sim 'value', retorna true
  if (!habit.target && entry.value) return true;

  // Se tem 'target' e 'value' é igual ou maior, retorna true
  if (entry.value! >= habit.target!) return true;

  // Caso contrario, retorna false
  return false;
};
