import { describe, expect, it } from "vitest";
import { Entry } from "@habits/shared/entry";
import { HabitType } from "@habits/shared/habit";
import { buildHeatmap, Cell } from "./buildHeatmap";
import { mergeEntries } from "./mergeEntries";

const makeEntry = (
  dayKey: string,
  extra: Partial<
    Pick<Entry, "_id" | "value" | "completed" | "workout" | "lecture">
  >,
): Entry => ({
  _id: dayKey,
  userId: "user-1",
  habitId: "habit-1",
  dayKey,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...extra,
});

const dayKeyAgo = (from: string, days: number): string => {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
};

const findCell = (cells: (Cell | null)[][], date: string) =>
  cells.flat().find((cell) => cell?.date === date);

describe("mergeEntries", () => {
  it("deduplica a mesma entry vinda da Home e do fetch", () => {
    const home = [makeEntry("2026-06-20", { _id: "X", value: 5 })];
    const fetched = [makeEntry("2026-06-20", { _id: "X", value: 9 })];

    const merged = mergeEntries(home, fetched);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.value).toBe(9);
  });

  it("mantém as entries da Home quando o fetch do range ainda não retornou", () => {
    const home = [
      makeEntry("2026-06-18", { value: 5 }),
      makeEntry("2026-06-20", { value: 3 }),
    ];

    expect(mergeEntries(home, [])).toEqual(home);
  });

  // Cenário do bug KAN-61: Home solo trae 90 días, el selector ofrece
  // hasta 365; el fetch propio trae lo que Home no alcanzó.
  it("quando o range excede os dados fetchados, o heatmap cobre a janela inteira sem duplicar dias", () => {
    const TO = "2026-06-30";
    const FROM = dayKeyAgo(TO, 180);

    const home = [
      makeEntry(dayKeyAgo(TO, 10), { _id: "X", value: 5 }),
      makeEntry(dayKeyAgo(TO, 80), { value: 3 }),
    ];
    // O servidor solo tiene datos hasta ~100 días atrás
    const fetched = [
      makeEntry(dayKeyAgo(TO, 95), { value: 7 }),
      makeEntry(dayKeyAgo(TO, 10), { _id: "X", value: 9 }),
    ];

    const merged = mergeEntries(home, fetched);

    expect(merged).toHaveLength(3);
    expect(merged.find((e) => e.dayKey === dayKeyAgo(TO, 10))?.value).toBe(9);

    const cells = buildHeatmap(merged, HabitType.QUANTITY, FROM, TO);

    // Dado más viejo que 90 días aparece — el fix central
    expect(findCell(cells, dayKeyAgo(TO, 95))?.label).toBe("7 unidades");

    // Sin días duplicados: una sola celda para el día 10, con el valor del fetch
    const day10Cells = cells
      .flat()
      .filter((cell) => cell?.date === dayKeyAgo(TO, 10));
    expect(day10Cells).toHaveLength(1);
    expect(day10Cells[0]?.label).toBe("9 unidades");

    // Más allá de cualquier dato: "Sin datos" sin crash
    expect(findCell(cells, dayKeyAgo(TO, 150))?.label).toBe("Sin datos");

    // La ventana completa FROM..TO queda cubierta (181 días inclusivos)
    const nonNullCells = cells.flat().filter((cell) => cell !== null);
    expect(nonNullCells).toHaveLength(181);
  });
});
