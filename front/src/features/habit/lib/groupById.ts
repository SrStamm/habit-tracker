import { Entry } from "@habits/shared/entry";

export const groupByHabitId = (entries: Entry[]): Map<string, Entry[]> => {
  const map = new Map<string, Entry[]>();

  entries.forEach((e) => {
    const current = map.get(e.habitId) ?? [];
    current.push(e);
    map.set(e.habitId, current);
  });

  return map;
};
