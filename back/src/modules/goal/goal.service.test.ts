import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HabitType, DurationOptions, type Habit } from "@habits/shared/habit";
import { GoalPeriod } from "@habits/shared/goal";

// Cria um mock para todas as funcoes usadas no service
const m = vi.hoisted(() => {
  return {
    // Entry
    entryFind: vi.fn(),
    // Goal — estáticos
    findOne: vi.fn(),
    deleteOne: vi.fn(),
    // Goal — instância
    save: vi.fn(),
    // payload recebido pelo construtor de Goal em createGoal
    construidos: [] as Array<Record<string, unknown>>,
  };
});

vi.mock("../../models/Entry", () => {
  return {
    default: {
      find: m.entryFind,
    },
  };
});

// createGoal faz `new Goal(...)` + `.save()`, então o mock precisa ser a
// própria classe construtora (com save no prototype) e não só um objeto.
vi.mock("../../models/Goal", () => {
  class GoalMock {
    [key: string]: unknown;

    constructor(data: Record<string, unknown>) {
      Object.assign(this, data);
      m.construidos.push(data);
    }

    save() {
      return m.save();
    }
  }

  return {
    default: Object.assign(GoalMock, {
      find: vi.fn(),
      findOne: m.findOne,
      deleteOne: m.deleteOne,
    }),
  };
});

import { getGoalProgress, createGoal, deleteGoal } from "./goal.service";
import { HttpError } from "../../lib/errors";

// O service recebe o habit do request (injetado por validateHabitOwner);
// aqui só interessam type e unit no cálculo do progresso.
const makeHabit = (extra: Partial<Habit> = {}): Habit => ({
  _id: "h1",
  userId: "u1",
  name: "hábito falso",
  type: HabitType.BOOLEAN,
  active: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...extra,
});

const goalDoc = (extra: Record<string, unknown> = {}) => ({
  _id: "g1",
  userId: "u1",
  habitId: "h1",
  amount: 7,
  period: GoalPeriod.WEEK,
  ...extra,
});

// ============================================================
// getGoalProgress(userId, habitId, goalId, habit) — janela em curso
// ============================================================
describe("getGoalProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.construidos.length = 0;
  });

  afterEach(() => vi.useRealTimers());

  it("lança HttpError 404 quando Goal.findOne retorna null", async () => {
    m.findOne.mockResolvedValue(null);

    const erro = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit(),
    ).catch((e: unknown) => e);

    expect(m.findOne).toHaveBeenCalledWith({
      _id: "g1",
      userId: "u1",
      habitId: "h1",
    });
    expect(erro).toBeInstanceOf(HttpError);
    expect((erro as HttpError).statusCode).toBe(404);
    // Sem goal não há por que buscar entries
    expect(m.entryFind).not.toHaveBeenCalled();
  });

  it("BOOLEAN: conta apenas entries com completed === true (mistura true/false/undefined) e devolve unit BOOLEAN", async () => {
    m.findOne.mockResolvedValue(goalDoc());
    m.entryFind.mockResolvedValue([
      { completed: true },
      { completed: false },
      { completed: true },
      { value: 5 }, // sem completed → undefined, não conta
    ]);

    const result = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(m.entryFind).toHaveBeenCalledWith({
      userId: "u1",
      habitId: "h1",
      dayKey: { $gte: expect.any(String), $lte: expect.any(String) },
    });
    expect(result.current).toBe(2);
    expect(result.unit).toBe("BOOLEAN");
  });

  it("QUANTITY: soma o value de todas as entries (sem value soma 0) e devolve a unidade livre do hábito", async () => {
    m.findOne.mockResolvedValue(goalDoc());
    m.entryFind.mockResolvedValue([{ value: 3 }, { value: 1.5 }, {}]);

    const result = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.QUANTITY, unit: "km" }),
    );

    expect(result.current).toBe(4.5);
    expect(result.unit).toBe("km");
  });

  it("DURATION com unit HOURS: soma value * 60 e devolve unit MINUTES", async () => {
    m.findOne.mockResolvedValue(goalDoc());
    m.entryFind.mockResolvedValue([{ value: 1 }, { value: 2 }]);

    const result = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.DURATION, unit: DurationOptions.HOURS }),
    );

    expect(result.current).toBe(180);
    expect(result.unit).toBe(DurationOptions.MINUTES);
  });

  it("DURATION com unit MINUTES: soma o value direto e devolve unit MINUTES", async () => {
    m.findOne.mockResolvedValue(goalDoc());
    m.entryFind.mockResolvedValue([{ value: 30 }, { value: 15 }]);

    const result = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.DURATION, unit: DurationOptions.MINUTES }),
    );

    expect(result.current).toBe(45);
    expect(result.unit).toBe(DurationOptions.MINUTES);
  });

  it("DURATION com unit SECONDS: soma value / 60 e devolve unit MINUTES", async () => {
    m.findOne.mockResolvedValue(goalDoc());
    m.entryFind.mockResolvedValue([{ value: 60 }, { value: 120 }]);

    const result = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.DURATION, unit: DurationOptions.SECONDS }),
    );

    expect(result.current).toBe(3);
    expect(result.unit).toBe(DurationOptions.MINUTES);
  });

  it("DURATION com unidade fora do enum lança HttpError 500", async () => {
    m.findOne.mockResolvedValue(goalDoc());
    m.entryFind.mockResolvedValue([{ value: 10 }]);

    const erro = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.DURATION, unit: "DAYS" }),
    ).catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(HttpError);
    expect((erro as HttpError).statusCode).toBe(500);
  });

  it("janela WEEK: filtra dayKey de segunda a domingo da semana em curso (APP_TIMEZONE)", async () => {
    vi.useFakeTimers();
    // Qua 2026-10-15 09:00 em Buenos Aires (UTC-3) → semana 12..18/10
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));

    m.findOne.mockResolvedValue(goalDoc({ period: GoalPeriod.WEEK }));
    m.entryFind.mockResolvedValue([]);

    await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(m.entryFind).toHaveBeenCalledWith({
      userId: "u1",
      habitId: "h1",
      dayKey: { $gte: "2026-10-12", $lte: "2026-10-18" },
    });
  });

  it("janela WEEK num domingo (último dia): o período segue sendo a MESMA semana, não a seguinte", async () => {
    vi.useFakeTimers();
    // Dom 2026-10-18 09:00 em Buenos Aires — fim da semana
    vi.setSystemTime(new Date("2026-10-18T12:00:00Z"));

    m.findOne.mockResolvedValue(goalDoc({ period: GoalPeriod.WEEK }));
    m.entryFind.mockResolvedValue([]);

    await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    // Se virasse "semana seguinte", periodStart seria 2026-10-19
    expect(m.entryFind).toHaveBeenCalledWith({
      userId: "u1",
      habitId: "h1",
      dayKey: { $gte: "2026-10-12", $lte: "2026-10-18" },
    });
  });

  it("janela WEEK usa a APP_TIMEZONE: 01:00Z de segunda ainda é domingo em Buenos Aires", async () => {
    vi.useFakeTimers();
    // Seg 2026-10-19 01:00Z = dom 2026-10-18 22:00 em Buenos Aires (UTC-3):
    // o servidor já viu segunda, a aplicação ainda está no domingo.
    vi.setSystemTime(new Date("2026-10-19T01:00:00Z"));

    m.findOne.mockResolvedValue(goalDoc({ period: GoalPeriod.WEEK }));
    m.entryFind.mockResolvedValue([]);

    await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(m.entryFind).toHaveBeenCalledWith({
      userId: "u1",
      habitId: "h1",
      dayKey: { $gte: "2026-10-12", $lte: "2026-10-18" },
    });
  });

  it("janela MONTH: filtra do dia 1 ao último dia do mês em curso", async () => {
    vi.useFakeTimers();
    // Qua 2026-10-15 09:00 em Buenos Aires
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));

    m.findOne.mockResolvedValue(goalDoc({ period: GoalPeriod.MONTH }));
    m.entryFind.mockResolvedValue([]);

    await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(m.entryFind).toHaveBeenCalledWith({
      userId: "u1",
      habitId: "h1",
      dayKey: { $gte: "2026-10-01", $lte: "2026-10-31" },
    });
  });

  it("janela MONTH no dia 31: periodEnd é o próprio dia 31 (sem estourar para o mês seguinte)", async () => {
    vi.useFakeTimers();
    // Sáb 2026-10-31 09:00 em Buenos Aires — último dia do mês
    vi.setSystemTime(new Date("2026-10-31T12:00:00Z"));

    m.findOne.mockResolvedValue(goalDoc({ period: GoalPeriod.MONTH }));
    m.entryFind.mockResolvedValue([]);

    await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(m.entryFind).toHaveBeenCalledWith({
      userId: "u1",
      habitId: "h1",
      dayKey: { $gte: "2026-10-01", $lte: "2026-10-31" },
    });
  });

  it("janela MONTH em fevereiro (28 dias em 2026): periodEnd é 28/02", async () => {
    vi.useFakeTimers();
    // Ter 2026-02-10 09:00 em Buenos Aires — 2026 não é bissexto
    vi.setSystemTime(new Date("2026-02-10T12:00:00Z"));

    m.findOne.mockResolvedValue(goalDoc({ period: GoalPeriod.MONTH }));
    m.entryFind.mockResolvedValue([]);

    await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(m.entryFind).toHaveBeenCalledWith({
      userId: "u1",
      habitId: "h1",
      dayKey: { $gte: "2026-02-01", $lte: "2026-02-28" },
    });
  });

  it("janela MONTH na virada do mês usa a APP_TIMEZONE: 01:00Z de 01/11 ainda é 31/10 em Buenos Aires", async () => {
    vi.useFakeTimers();
    // Dom 2026-11-01 01:00Z = sáb 2026-10-31 22:00 em Buenos Aires (UTC-3):
    // o mês em curso para a aplicação sigue sendo outubro.
    vi.setSystemTime(new Date("2026-11-01T01:00:00Z"));

    m.findOne.mockResolvedValue(goalDoc({ period: GoalPeriod.MONTH }));
    m.entryFind.mockResolvedValue([]);

    await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(m.entryFind).toHaveBeenCalledWith({
      userId: "u1",
      habitId: "h1",
      dayKey: { $gte: "2026-10-01", $lte: "2026-10-31" },
    });
  });

  it("sem entries na janela: current 0 e pct 0 (não é erro)", async () => {
    m.findOne.mockResolvedValue(goalDoc({ amount: 5 }));
    m.entryFind.mockResolvedValue([]);

    const result = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(result.current).toBe(0);
    expect(result.pct).toBe(0);
  });

  it("pct = (current / amount) * 100", async () => {
    m.findOne.mockResolvedValue(goalDoc({ amount: 7 }));
    m.entryFind.mockResolvedValue([
      { completed: true },
      { completed: true },
      { completed: true },
    ]);

    const result = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(result.pct).toBeCloseTo(42.86, 2);
    expect(result.pct).toBe((3 / 7) * 100);
  });

  it("devolve os 7 campos do progresso (goalId, amount, current, pct, unit, periodStart, periodEnd)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));

    m.findOne.mockResolvedValue(goalDoc({ amount: 7, period: GoalPeriod.WEEK }));
    m.entryFind.mockResolvedValue([{ completed: true }, { completed: true }]);

    const result = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(result).toEqual({
      goalId: "g1",
      amount: 7,
      current: 2,
      pct: (2 / 7) * 100,
      unit: "BOOLEAN",
      periodStart: "2026-10-12",
      periodEnd: "2026-10-18",
    });
  });
});

// ============================================================
// createGoal(userId, habitId, data) — grava e mapeia para DTO
// ============================================================
describe("createGoal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.construidos.length = 0;
  });

  it("instancia Goal com { userId, habitId, ...data }, chama save() e mapeia para GoalResponseDTO", async () => {
    const data = { amount: 5, period: GoalPeriod.WEEK };
    m.save.mockResolvedValue({
      _id: "g1",
      userId: "u1",
      habitId: "h1",
      amount: 5,
      period: GoalPeriod.WEEK,
    });

    const result = await createGoal("u1", "h1", data);

    expect(m.construidos[0]).toEqual({
      userId: "u1",
      habitId: "h1",
      amount: 5,
      period: "WEEK",
    });
    expect(m.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      _id: "g1",
      userId: "u1",
      habitId: "h1",
      amount: 5,
      period: "WEEK",
    });
  });
});

// ============================================================
// deleteGoal(userId, habitId, goalId) — 404 se nada foi removido
// ============================================================
describe("deleteGoal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("filtra por { userId, habitId, _id } e lança HttpError 404 quando deletedCount === 0", async () => {
    m.deleteOne.mockResolvedValue({ deletedCount: 0 });

    const erro = await deleteGoal("u1", "h1", "g1").catch((e: unknown) => e);

    expect(m.deleteOne).toHaveBeenCalledWith({
      userId: "u1",
      habitId: "h1",
      _id: "g1",
    });
    expect(erro).toBeInstanceOf(HttpError);
    expect((erro as HttpError).statusCode).toBe(404);
  });

  it("deletedCount === 1 resolve sem erro (retorna undefined)", async () => {
    m.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await expect(deleteGoal("u1", "h1", "g1")).resolves.toBeUndefined();
  });
});
