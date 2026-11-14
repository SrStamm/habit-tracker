import { Entry } from "@habits/shared/entry";
import { shiftDayKey } from "@habits/shared/dayKey";
import { HabitType } from "@habits/shared/habit";
import { Workout } from "@habits/shared/workout";
import { workoutSummary } from "../../workout/lib/workoutSummary";
import { Lecture } from "@habits/shared/lecture";
import { lectureSummary } from "../../lecture/lectureSummary";
import { fmtDayKey } from "../../../lib/fmtDayKey";

export type Cell = {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
};

// Acepta un dayKey (se devuelve tal cual) o un instante ISO, que se convierte
// al día canónico de la app. Antes usaba componentes locales del navegador y
// eso mezclaba dos autoridades de "qué día es".
export const toDayKey = (date: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  return fmtDayKey(new Date(date));
};

const groupEntriesByDay = (
  entries: Entry[],
  typeHabit: HabitType,
): Map<string, number> => {
  const valueEntries: Map<string, number> = new Map();

  entries.forEach((m) => {
    const previous = valueEntries.get(m.dayKey) ?? 0;

    switch (typeHabit) {
      case HabitType.BOOLEAN:
        valueEntries.set(m.dayKey, Math.max(previous, m.completed ? 1 : 0));
        break;

      case HabitType.QUANTITY:
      case HabitType.DURATION:
        // Soma em vez de substituir: se algum dia tiver mais de uma entry
        // (migração, edição manual), o valor do dia é o total, não o último.
        valueEntries.set(m.dayKey, previous + (m.value ?? 0));
        break;
      case HabitType.WORKOUT:
        valueEntries.set(m.dayKey, m.workout?.length ? 1 : 0);
        break;
      case HabitType.LECTURE:
        valueEntries.set(m.dayKey, m.lecture?.length ? 1 : 0);
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

export const valueToLevel = (value: number, max: number): 0 | 1 | 2 | 3 | 4 => {
  if (max === 0) return 0;

  const newValue = value / max;
  const bucket = newValue * 4;
  const clamp = Math.ceil(bucket);

  // value/max está en [0,1], por lo que Math.ceil(bucket) nunca sale de [0,4];
  // TS no puede probar esa cota, por eso el cast explícito.
  return Math.min(4, clamp) as 0 | 1 | 2 | 3 | 4;
};

// Aritmética de calendario pura (compartida con el resto de la app): el
// date local podía saltarse o repetir un día en fusos con DST a medianoche.
const addOneDay = (date: string): string => shiftDayKey(date, 1);

export const buildDayRange = (from: string, to: string) => {
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
  workoutsByDay: Map<string, Workout>,
  lecturesByDay: Map<string, Lecture>,
  unit?: string,
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
          label = `${value} ${unit ?? "unidades"}`;
          break;
        case HabitType.DURATION:
          label = `${value} ${unit ?? "min"}`;
          break;
        case HabitType.WORKOUT: {
          const workout = workoutsByDay.get(v) ?? [];
          label = workoutSummary(workout);
          break;
        }
        case HabitType.LECTURE: {
          const lecture = lecturesByDay.get(v) ?? [];
          label = lectureSummary(lecture);
          break;
        }
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

export const createPadding = (cells: Cell[], from: string) => {
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
  target?: number,
  unit?: string,
): (Cell | null)[][] => {
  from = toDayKey(from);
  to = toDayKey(to);

  // Generar el array de dias entre from a to
  const entriesGrouped = groupEntriesByDay(entries, typeHabit);

  const max =
    typeHabit === HabitType.WORKOUT
      ? 1
      : (target ?? getMaxValue(entriesGrouped));

  const workoutsByDay = new Map<string, Workout>();
  entries.forEach((e) => {
    if (e.workout?.length) workoutsByDay.set(e.dayKey, e.workout);
  });

  const lecturesByDay = new Map<string, Lecture>();
  entries.forEach((e) => {
    if (e.lecture?.length) lecturesByDay.set(e.dayKey, e.lecture);
  });

  const dayRange = buildDayRange(from, to);

  const cells = createCells(
    dayRange,
    entriesGrouped,
    max,
    typeHabit,
    workoutsByDay,
    lecturesByDay,
    unit,
  );

  return createPadding(cells, from);
};
