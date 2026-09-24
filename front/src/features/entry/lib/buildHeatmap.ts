import { Entry } from "@habits/shared/entry";
import { HabitType } from "@habits/shared/habit";

export type Cell = {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
};

const toLocalDayKey = (date: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const parsed = new Date(date);

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const groupEntriesByDay = (
  entries: Entry[],
  typeHabit: HabitType,
): Map<string, number> => {
  const valueEntries: Map<string, number> = new Map();

  entries.forEach((m) => {
    const previous = valueEntries.get(m.date) ?? 0;
    let newValue = 0;

    switch (typeHabit) {
      case HabitType.BOOLEAN:
        valueEntries.set(m.date, Math.max(previous, m.completed ? 1 : 0));
        break;

      case HabitType.QUANTITY:
      case HabitType.DURATION:
        newValue = previous + (m.value ?? 0);

        valueEntries.set(m.date, newValue);
        break;
    }
  });

  return valueEntries;
};

const getMaxValue = (values: Map<string, number>): number => {
  if (values.size === 0) {
    return 0;
  }

  return Math.max(...values.values());
};

const valueToLevel = (value: number, max: number): 0 | 1 | 2 | 3 | 4 => {
  if (max === 0) return 0;

  const newValue = value / max;
  const bucket = newValue * 4;
  const clamp = Math.ceil(bucket);

  // value/max está en [0,1], por lo que Math.ceil(bucket) nunca sale de [0,4];
  // TS no puede probar esa cota, por eso el cast explícito.
  return (Math.min(4, clamp)) as 0 | 1 | 2 | 3 | 4;
};

const addOneDay = (date: string): string => {
  const [year, month, day] = date.split("-");

  const currentDate = new Date(Number(year), Number(month) - 1, Number(day));
  currentDate.setDate(currentDate.getDate() + 1);

  return `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
};

const buildDayRange = (from: string, to: string) => {
  const array: string[] = [];
  let currentDate = from;

  // Comparar la fecha actual con la fecha limite
  while (currentDate <= to) {
    array.push(currentDate);

    // Fecha actual + 1 dia
    currentDate = addOneDay(currentDate);
  }

  return array;
};

const createCells = (
  dayRange: string[],
  values: Map<string, number>,
  max: number,
  typeHabit: HabitType,
): Cell[] => {
  const cellArray: Cell[] = [];

  dayRange.forEach((v) => {
    const value = values.get(v);
    const level = valueToLevel(value ?? 0, max);
    let label = "";

    if (!values.has(v)) {
      label = "Sin datos";
    } else {
      switch (typeHabit) {
        case HabitType.BOOLEAN:
          label = value === 1 ? "Completado" : "No completado";
          break;
        case HabitType.QUANTITY:
          label = value + " repeticiones";
          break;
        case HabitType.DURATION:
          label = value + " min";
          break;
      }
    }

    cellArray.push({
      date: v,
      level,
      label,
    });
  });

  return cellArray;
};

const fillNulls = (quantity: number): null[] => {
  return Array.from({ length: quantity }, () => null);
};

const createPadding = (cells: Cell[], from: string) => {
  const [year, month, day] = from.split("-");
  const currentDate = new Date(Number(year), Number(month) - 1, Number(day));

  const weekday = (currentDate.getDay() + 6) % 7;
  const arrayWeekday: null[] = fillNulls(weekday);

  const padded = [...arrayWeekday, ...cells];

  const result: (Cell | null)[][] = [];
  let week: (Cell | null)[] = [];

  padded.forEach((v) => {
    week.push(v);

    if (week.length === 7) {
      result.push(week);
      week = [];
    }
  });

  if (week.length < 7) {
    const arrayFinalWeek: null[] = fillNulls(7 - week.length);
    result.push([...week, ...arrayFinalWeek]);
  }

  return result;
};

export const buildHeatmap = (
  entries: Entry[],
  typeHabit: HabitType,
  from: string,
  to: string,
): (Cell | null)[][] => {
  from = toLocalDayKey(from);
  to = toLocalDayKey(to);

  // Normaliza os dates dos entries
  const normalizedEntries = entries.map((entry) => ({
    ...entry,
    date: toLocalDayKey(entry.date),
  }));

  // Generar el array de dias entre from a to
  const entriesGrouped = groupEntriesByDay(normalizedEntries, typeHabit);

  const max = getMaxValue(entriesGrouped);

  const dayRange = buildDayRange(from, to);

  const cells = createCells(dayRange, entriesGrouped, max, typeHabit);

  return createPadding(cells, from);
};
