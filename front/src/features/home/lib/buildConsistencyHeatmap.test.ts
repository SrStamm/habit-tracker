import { describe, expect, it } from "vitest";
import { Entry } from "@habits/shared/entry";
import { Habit, HabitType } from "@habits/shared/habit";
import { Cell } from "../../entry/lib/buildHeatmap";
import { buildConsistencyHeatmap } from "./buildConsistencyHeatmap";

const makeHabit = (extra: Partial<Habit>): Habit => ({
  _id: "habit-1",
  userId: "user-1",
  name: "Hábito",
  type: HabitType.BOOLEAN,
  active: true,
  createdAt: new Date(2025, 11, 1),
  updatedAt: new Date(2025, 11, 1),
  ...extra,
});

const makeEntry = (
  habitId: string,
  dayKey: string,
  extra: Partial<Pick<Entry, "value" | "completed">> = {},
): Entry => ({
  _id: `${habitId}-${dayKey}`,
  userId: "user-1",
  habitId,
  dayKey,
  createdAt: new Date(2026, 0, 1),
  updatedAt: new Date(2026, 0, 1),
  ...extra,
});

const findCell = (cells: (Cell | null)[][], date: string) =>
  cells.flat().find((cell) => cell?.date === date);

const FROM = "2026-01-01";
const TO = "2026-01-07";

describe("buildConsistencyHeatmap — denominador com createdAt a meio da janela", () => {
  it("criado a meio não penaliza os dias anteriores; depois conta 2 hábitos", () => {
    const habits = [
      makeHabit({ _id: "h-whole", createdAt: new Date(2025, 11, 1) }),
      makeHabit({ _id: "h-late", createdAt: new Date(2026, 0, 5) }),
    ];
    const cells = buildConsistencyHeatmap(habits, [], FROM, TO);

    // Antes do createdAt do h-late só existe h-whole → denominador 1.
    expect(findCell(cells, "2026-01-01")?.label).toBe("0 de 1 hábitos (0%)");
    expect(findCell(cells, "2026-01-04")?.label).toBe("0 de 1 hábitos (0%)");

    // A partir do dia de criação passam a ser 2.
    expect(findCell(cells, "2026-01-05")?.label).toBe("0 de 2 hábitos (0%)");
    expect(findCell(cells, "2026-01-07")?.label).toBe("0 de 2 hábitos (0%)");
  });

  it("marca 'Sin datos' nos dias anteriores ao createdAt quando é o único hábito", () => {
    const habits = [makeHabit({ createdAt: new Date(2026, 0, 5) })];
    const cells = buildConsistencyHeatmap(habits, [], FROM, TO);

    expect(findCell(cells, "2026-01-01")?.label).toBe("Sin datos");
    expect(findCell(cells, "2026-01-04")?.label).toBe("Sin datos");
    expect(findCell(cells, "2026-01-05")?.label).toBe("0 de 1 hábitos (0%)");
  });
});

describe("buildConsistencyHeatmap — conjunto filtrado (categoria)", () => {
  it("usa só o subconjunto de hábitos que o chamador passou", () => {
    const completados = ["h-a", "h-b", "h-c", "h-d"].map((id) =>
      makeHabit({ _id: id }),
    );
    const entries = completados.map((h) =>
      makeEntry(h._id, "2026-01-02", { completed: true }),
    );

    // O filtro de categoria acontece antes da chamada: só 2 dos 4 hábitos.
    const subset = completados.slice(0, 2);
    const cells = buildConsistencyHeatmap(subset, entries, FROM, TO);

    // Com os 4 seria "2 de 4" se só 2 estivessem completos; aqui os 2
    // passados estão completos → 100% do subconjunto.
    expect(findCell(cells, "2026-01-02")?.label).toBe("2 de 2 hábitos (100%)");
    expect(findCell(cells, "2026-01-02")?.level).toBe(4);
  });
});

describe("buildConsistencyHeatmap — dias sem dados", () => {
  it("sem hábitos ativos todas as células ficam 'Sin datos'", () => {
    const cells = buildConsistencyHeatmap([], [], FROM, TO);

    const filled = cells.flat().filter((c): c is Cell => c !== null);
    expect(filled.length).toBeGreaterThan(0);
    expect(filled.every((c) => c.label === "Sin datos")).toBe(true);
  });

  it("exclui hábitos com active: false do denominador", () => {
    const habits = [makeHabit({ active: false })];
    const cells = buildConsistencyHeatmap(habits, [], FROM, TO);

    const filled = cells.flat().filter((c): c is Cell => c !== null);
    expect(filled.every((c) => c.label === "Sin datos")).toBe(true);
  });
});

describe("buildConsistencyHeatmap — numerador via isCompleted", () => {
  it("BOOLEAN conta quando completed é true e não conta quando é false", () => {
    const habits = [makeHabit({ _id: "h-bool" })];
    const entries = [
      makeEntry("h-bool", "2026-01-02", { completed: true }),
      makeEntry("h-bool", "2026-01-03", { completed: false }),
    ];
    const cells = buildConsistencyHeatmap(habits, entries, FROM, TO);

    expect(findCell(cells, "2026-01-02")?.label).toBe("1 de 1 hábitos (100%)");
    expect(findCell(cells, "2026-01-03")?.label).toBe("0 de 1 hábitos (0%)");
  });

  it("QUANTITY conta só quando value >= target", () => {
    const habits = [
      makeHabit({ _id: "h-qty", type: HabitType.QUANTITY, target: 10 }),
    ];
    const entries = [
      makeEntry("h-qty", "2026-01-02", { value: 5 }), // abaixo do target
      makeEntry("h-qty", "2026-01-03", { value: 10 }), // igual ao target
    ];
    const cells = buildConsistencyHeatmap(habits, entries, FROM, TO);

    expect(findCell(cells, "2026-01-02")?.label).toBe("0 de 1 hábitos (0%)");
    expect(findCell(cells, "2026-01-03")?.label).toBe("1 de 1 hábitos (100%)");
  });
});

describe("buildConsistencyHeatmap — formato da label e buckets de nível", () => {
  const habits = ["h-a", "h-b", "h-c", "h-d"].map((id) => makeHabit({ _id: id }));

  it("2 de 4 concluídos → label exata e nível 2 (ratio 0.5)", () => {
    const entries = [
      makeEntry("h-a", "2026-01-02", { completed: true }),
      makeEntry("h-b", "2026-01-02", { completed: true }),
      makeEntry("h-c", "2026-01-02", { completed: false }),
      makeEntry("h-d", "2026-01-02", { completed: false }),
    ];
    const cells = buildConsistencyHeatmap(habits, entries, FROM, TO);

    const cell = findCell(cells, "2026-01-02");
    expect(cell?.label).toBe("2 de 4 hábitos (50%)");
    expect(cell?.level).toBe(2);
  });

  it("ratio 1 → nível 4 e ratio 0 → nível 0", () => {
    const allDone = habits.map((h) =>
      makeEntry(h._id, "2026-01-02", { completed: true }),
    );
    const cells = buildConsistencyHeatmap(habits, allDone, FROM, TO);

    expect(findCell(cells, "2026-01-02")?.level).toBe(4);
    expect(findCell(cells, "2026-01-02")?.label).toBe("4 de 4 hábitos (100%)");

    const noneDone = habits.map((h) =>
      makeEntry(h._id, "2026-01-03", { completed: false }),
    );
    const cellsNone = buildConsistencyHeatmap(habits, noneDone, FROM, TO);

    expect(findCell(cellsNone, "2026-01-03")?.level).toBe(0);
    expect(findCell(cellsNone, "2026-01-03")?.label).toBe("0 de 4 hábitos (0%)");
  });
});

describe("buildConsistencyHeatmap — createdAt como ISO string e como Date", () => {
  it("produz o mesmo resultado com createdAt em ISO string ou Date", () => {
    const asDate = [makeHabit({ createdAt: new Date(2026, 0, 5, 12) })];
    const asIso = [
      makeHabit({ createdAt: "2026-01-05T12:00:00" as unknown as Date }),
    ];

    const cellsDate = buildConsistencyHeatmap(asDate, [], FROM, TO);
    const cellsIso = buildConsistencyHeatmap(asIso, [], FROM, TO);

    expect(cellsIso).toEqual(cellsDate);
    expect(findCell(cellsIso, "2026-01-04")?.label).toBe("Sin datos");
    expect(findCell(cellsIso, "2026-01-05")?.label).toBe("0 de 1 hábitos (0%)");
  });
});
