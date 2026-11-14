import { afterEach, describe, expect, it } from "vitest";
import { Entry } from "@habits/shared/entry";
import { Habit, HabitType } from "@habits/shared/habit";
import { dayKeyFrom, shiftDayKey } from "@habits/shared/dayKey";
import { setAppTimeZone } from "../../../lib/appTimeZone";
import { calculateStreak } from "./calculateStreak";

// La zona fija evita depender de la TZ del proceso. Los dayKeys se construyen
// relativos al "hoy" real: el test debe valer cualquier día que se ejecute.
const ZONE = "America/Argentina/Buenos_Aires";

const makeHabit = (): Habit => ({
  _id: "habit-1",
  userId: "user-1",
  name: "Hábito",
  type: HabitType.BOOLEAN,
  active: true,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
});

const makeEntry = (dayKey: string): Entry => ({
  _id: `entry-${dayKey}`,
  userId: "user-1",
  habitId: "habit-1",
  dayKey,
  completed: true,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
});

const todayKey = (): string => dayKeyFrom(new Date(), ZONE);

const entriesForDaysAgo = (daysAgo: number[]): Entry[] =>
  daysAgo.map((days) => makeEntry(shiftDayKey(todayKey(), -days)));

describe("calculateStreak", () => {
  afterEach(() => setAppTimeZone(undefined));

  it("cuenta 4 días consecutivos completados hasta hoy", () => {
    setAppTimeZone(ZONE);

    const streak = calculateStreak(makeHabit(), entriesForDaysAgo([0, 1, 2, 3]));

    expect(streak).toBe(4);
  });

  it("un hueco corta la racha", () => {
    setAppTimeZone(ZONE);

    // Hoy, ayer y anteayer no: el día -2 falta y corta la cuenta en 2.
    const streak = calculateStreak(makeHabit(), entriesForDaysAgo([0, 1, 3]));

    expect(streak).toBe(2);
  });

  it("hoy sin completar no rompe la racha: cuenta desde ayer", () => {
    setAppTimeZone(ZONE);

    const streak = calculateStreak(makeHabit(), entriesForDaysAgo([1, 2, 3]));

    expect(streak).toBe(3);
  });

  it("atraviesa el cambio de mes sin perder días", () => {
    setAppTimeZone(ZONE);

    // 35 días consecutivos siempre cruzan al menos un borde de mes; los
    // dayKeys salen de shiftDayKey, sin asumir el día del mes de hoy.
    const days = Array.from({ length: 35 }, (_, i) => i);

    const streak = calculateStreak(makeHabit(), entriesForDaysAgo(days));

    expect(streak).toBe(35);
  });
});
