// Helper que receve as entries
// Conta a quantitade de dias que cumprio com o Habit
// O dia de hoje, se ainda nao foi feito, nao conta para quebrar a Streak

import { Entry } from "@habits/shared/entry";
import { Habit } from "@habits/shared/habit";
import { isCompleted } from "./isCompleted";
import { fmtDayKey } from "../../../lib/fmtDayKey";

const previousDayKey = (dayKey: string): string => {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, m - 1, d); // ← constructor LOCAL
  date.setDate(date.getDate() - 1);
  return fmtDayKey(date);
};

export const calculateStreak = (habit: Habit, entries: Entry[]): number => {
  const byDay = new Map(entries.map((e) => [e.dayKey, e]));

  let day = fmtDayKey(new Date());
  let streak = 0;

  if (!isCompleted(habit, byDay.get(day))) {
    day = previousDayKey(day);
  }

  while (isCompleted(habit, byDay.get(day))) {
    streak++;
    day = previousDayKey(day);
  }

  return streak;
};
