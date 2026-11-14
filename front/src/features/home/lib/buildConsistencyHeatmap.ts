import { Entry } from "@habits/shared/entry";
import { Habit } from "@habits/shared/habit";
import {
  buildDayRange,
  Cell,
  createPadding,
  toDayKey,
  valueToLevel,
} from "../../entry/lib/buildHeatmap";
import { isCompleted } from "../../habit/lib/isCompleted";

// Heatmap global de consistência: por dia, razão entre hábitos cumpridos e
// hábitos ativos existentes nesse dia. Archivados ficam de fora (v1).
export const buildConsistencyHeatmap = (
  habits: Habit[],
  entries: Entry[],
  from: string,
  to: string,
): (Cell | null)[][] => {
  const fromKey = toDayKey(from);
  const toKey = toDayKey(to);

  const activeHabits = habits
    .filter((h) => h.active)
    .map((habit) => ({
      habit,
      // createdAt chega como ISO string (JSON) ou Date — normalizar para a
      // chave de dia local permite comparar lexicograficamente com <=.
      createdDayKey: toDayKey(String(habit.createdAt)),
    }));

  // Última entry por hábito+dia (last wins).
  const entryIndex = new Map<string, Entry>();
  entries.forEach((e) => {
    entryIndex.set(`${e.habitId}|${e.dayKey}`, e);
  });

  const dayRange = buildDayRange(fromKey, toKey);

  const cells: Cell[] = dayRange.map((day) => {
    // Denominador: só hábitos já criados nesse dia (criado no dia 60 não
    // penaliza os dias 1-59).
    const born = activeHabits.filter((h) => h.createdDayKey <= day);
    const total = born.length;

    if (total === 0) {
      return { date: day, level: 0, label: "Sin datos" };
    }

    const done = born.filter(({ habit }) =>
      isCompleted(habit, entryIndex.get(`${habit._id}|${day}`)),
    ).length;

    const pct = Math.round((done / total) * 100);

    return {
      date: day,
      level: valueToLevel(done, total),
      label: `${done} de ${total} hábitos (${pct}%)`,
    };
  });

  return createPadding(cells, fromKey);
};
