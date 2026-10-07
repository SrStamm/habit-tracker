import { describe, expect, it } from "vitest";
import { Entry } from "@habits/shared/entry";
import { HabitType } from "@habits/shared/habit";
import { buildHeatmap, Cell } from "./buildHeatmap";

const makeEntry = (
  dayKey: string,
  extra: Partial<Pick<Entry, "value" | "completed">>,
): Entry => ({
  _id: dayKey,
  userId: "user-1",
  habitId: "habit-1",
  dayKey,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...extra,
});

const findCell = (cells: (Cell | null)[][], date: string) =>
  cells.flat().find((cell) => cell?.date === date);

const FROM = "2026-01-01";
const TO = "2026-01-07";

describe("buildHeatmap com HabitType.QUANTITY", () => {
  const entries = [
    makeEntry("2026-01-02", { value: 10 }),
    makeEntry("2026-01-04", { value: 5 }),
    makeEntry("2026-01-06", { value: 0 }),
  ];

  // Regressão: groupEntriesByDay gravava 0 para QUANTITY/DURATION, então o
  // heatmap desses hábitos ficava sempre cinzento, independentemente do valor.
  it("soma o value do dia e usa-o para o nível, em vez de gravar 0", () => {
    const cells = buildHeatmap(entries, HabitType.QUANTITY, FROM, TO);

    expect(findCell(cells, "2026-01-02")?.level).toBe(4);
    expect(findCell(cells, "2026-01-04")?.level).toBe(2);
  });

  it("escala pelo maior valor do período, não pelo target", () => {
    const cells = buildHeatmap(entries, HabitType.QUANTITY, FROM, TO);

    // 10 é o máximo → 4; 5 é metade → (0.5 * 4) arredondado para cima → 2
    expect(findCell(cells, "2026-01-02")?.level).toBe(4);
    expect(findCell(cells, "2026-01-06")?.level).toBe(0);
  });

  it("acende os dias com entry mesmo que o valor seja 0", () => {
    const cells = buildHeatmap(entries, HabitType.QUANTITY, FROM, TO);

    const zeroDay = findCell(cells, "2026-01-06");
    expect(zeroDay?.level).toBe(0);
    expect(zeroDay?.label).toBe("0 unidades");
    expect(findCell(cells, "2026-01-03")?.label).toBe("Sin datos");
  });

  it("usa o unit do hábito na label, em vez de 'repeticiones' fixo", () => {
    const cells = buildHeatmap(
      entries,
      HabitType.QUANTITY,
      FROM,
      TO,
      undefined,
      "copos",
    );

    expect(findCell(cells, "2026-01-02")?.label).toBe("10 copos");
  });
});

describe("buildHeatmap com HabitType.DURATION", () => {
  it("soma os minutos do dia e rotula com o unit", () => {
    const entries = [makeEntry("2026-01-03", { value: 45 })];
    const cells = buildHeatmap(
      entries,
      HabitType.DURATION,
      FROM,
      TO,
      undefined,
      "min",
    );

    const cell = findCell(cells, "2026-01-03");
    expect(cell?.level).toBe(4);
    expect(cell?.label).toBe("45 min");
  });

  it("cai para 'min' quando o hábito não tem unit", () => {
    const entries = [makeEntry("2026-01-03", { value: 45 })];
    const cells = buildHeatmap(entries, HabitType.DURATION, FROM, TO);

    expect(findCell(cells, "2026-01-03")?.label).toBe("45 min");
  });
});

describe("buildHeatmap com HabitType.BOOLEAN", () => {
  it("marca o dia como completo quando completed é true", () => {
    const entries = [
      makeEntry("2026-01-02", { completed: true }),
      makeEntry("2026-01-04", { completed: false }),
    ];
    const cells = buildHeatmap(entries, HabitType.BOOLEAN, FROM, TO);

    expect(findCell(cells, "2026-01-02")?.level).toBe(4);
    expect(findCell(cells, "2026-01-02")?.label).toBe("Completado");
    expect(findCell(cells, "2026-01-04")?.label).toBe("No completado");
  });

  it("preenche a primeira semana com nulls para alinhar os weekdays", () => {
    const cells = buildHeatmap([], HabitType.BOOLEAN, FROM, TO);

    // 2026-01-01 es jueves → 3 días de padding (lun–mié)
    expect(cells[0]?.slice(0, 3)).toEqual([null, null, null]);
    expect(cells[0]?.[3]?.date).toBe("2026-01-01");
  });
});
