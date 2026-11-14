// Helper que receve as entries
// Conta a quantitade de dias que cumprio com o Habit
// O dia de hoje, se ainda nao foi feito, nao conta para quebrar a Streak

import { Entry } from "@habits/shared/entry";
import { Habit } from "@habits/shared/habit";
import { shiftDayKey } from "@habits/shared/dayKey";
import { isCompleted } from "./isCompleted";
import { fmtDayKey } from "../../../lib/fmtDayKey";

export const calculateStreak = (habit: Habit, entries: Entry[]): number => {
  const byDay = new Map(entries.map((e) => [e.dayKey, e]));

  let day = fmtDayKey(new Date());
  let streak = 0;

  if (!isCompleted(habit, byDay.get(day))) {
    day = shiftDayKey(day, -1);
  }

  while (isCompleted(habit, byDay.get(day))) {
    streak++;
    day = shiftDayKey(day, -1);
  }

  return streak;
};
