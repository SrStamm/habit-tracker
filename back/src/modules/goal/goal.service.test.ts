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

const lectureEntry = (
  dayKey: string,
  lecture: Array<{ book?: string | null; page?: number | null }> | null,
) => ({ dayKey, lecture });

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

  it("pct = (current / amount) * 100 arredondado a 2 casas", async () => {
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

    expect(result.pct).toBe(42.86);
  });

  it("arredonda pct para 2 casas decimais: 1/3 vira 33.33, não 33.33333333333333", async () => {
    m.findOne.mockResolvedValue(goalDoc({ amount: 3 }));
    m.entryFind.mockResolvedValue([{ completed: true }]);

    const result = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(result.pct).toBe(33.33);
    expect(result.pct).not.toBe((1 / 3) * 100);
  });

  it("arredonda pct para cima: 2/3 vira 66.67", async () => {
    m.findOne.mockResolvedValue(goalDoc({ amount: 3 }));
    m.entryFind.mockResolvedValue([
      { completed: true },
      { completed: true },
    ]);

    const result = await getGoalProgress(
      "u1",
      "h1",
      "g1",
      makeHabit({ type: HabitType.BOOLEAN }),
    );

    expect(result.pct).toBe(66.67);
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
      pct: 28.57,
      unit: "BOOLEAN",
      periodStart: "2026-10-12",
      periodEnd: "2026-10-18",
    });
  });

  // ============================================================
  // WORKOUT — volume = Σ(reps × peso); peso 0 explícito conta reps
  // ============================================================
  describe("WORKOUT", () => {
    it("soma o volume de todas as entries, exercícios e séries e devolve unit kg·rep", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 270, period: GoalPeriod.WEEK }),
      );
      m.entryFind.mockResolvedValue([
        {
          workout: [
            // 10*20 + 5*10 = 250
            { sets: [{ reps: 10, weight: 20 }, { reps: 5, weight: 10 }] },
          ],
        },
        {
          workout: [
            { sets: [{ reps: 8, weight: 2.5 }] }, // 20
            { sets: [] }, // 0
          ],
        },
        { value: 999 }, // entry de outro tipo não contribui
        {}, // sem workout
      ]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.WORKOUT }),
      );

      expect(result.current).toBe(270);
      expect(result.unit).toBe("kg·rep");
      expect(result.pct).toBe(100);
      expect(m.entryFind).toHaveBeenCalledTimes(1);
    });

    it("trata reps/weight ausentes ou nulos como 0", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 10, period: GoalPeriod.WEEK }),
      );
      m.entryFind.mockResolvedValue([
        {
          workout: [
            {
              sets: [
                { reps: null, weight: 100 }, // 0
                { reps: 10, weight: null }, // 0
                { reps: 10 }, // sem peso → 0
                {}, // sem reps nem peso → 0
              ],
            },
          ],
        },
        { workout: [{ sets: [{ reps: 4, weight: 2.5 }] }] }, // 10
      ]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.WORKOUT }),
      );

      expect(result.current).toBe(10);
      expect(result.pct).toBe(100);
    });

    it("conta reps de séries com peso 0 explícito (peso corporal)", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 45, period: GoalPeriod.WEEK }),
      );
      m.entryFind.mockResolvedValue([
        {
          workout: [
            {
              sets: [
                { reps: 15, weight: 0 }, // 15
                { reps: 10, weight: 0 }, // 10
              ],
            },
            { sets: [{ reps: 20, weight: 0 }] }, // 20
          ],
        },
      ]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.WORKOUT }),
      );

      expect(result.current).toBe(45);
      expect(result.pct).toBe(100);
      expect(result.unit).toBe("kg·rep");
    });

    it("sem entries na janela: current 0, pct 0 e unit kg·rep", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 500, period: GoalPeriod.WEEK }),
      );
      m.entryFind.mockResolvedValue([]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.WORKOUT }),
      );

      expect(result.current).toBe(0);
      expect(result.pct).toBe(0);
      expect(result.unit).toBe("kg·rep");
      expect(m.entryFind).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // LECTURE — Δ páginas por livro na janela vs. baseline anterior
  // ============================================================
  describe("LECTURE", () => {
    beforeEach(() => {
      m.entryFind.mockReset();
      m.findOne.mockReset();
      vi.useFakeTimers();
      // Qua 2026-10-15 09:00 em Buenos Aires → semana 12..18/10
      vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
    });

    it("soma o delta de páginas por livro contra o baseline e devolve unit páginas", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 110, period: GoalPeriod.WEEK }),
      );
      m.entryFind
        .mockResolvedValueOnce([
          lectureEntry("2026-10-14", [{ book: "A", page: 150 }]),
          lectureEntry("2026-10-12", [{ book: "B", page: 80 }]),
          // sem baseline → conta desde 0
          lectureEntry("2026-10-13", [{ book: "C", page: 30 }]),
        ])
        .mockResolvedValueOnce([
          lectureEntry("2026-10-05", [{ book: "A", page: 100 }]),
          lectureEntry("2026-10-01", [{ book: "B", page: 50 }]),
        ]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.LECTURE }),
      );

      // A: 150-100, B: 80-50, C: 30-0
      expect(result.current).toBe(110);
      expect(result.unit).toBe("páginas");
      expect(result.pct).toBe(100);
      expect(m.entryFind).toHaveBeenCalledTimes(2);
      expect(m.entryFind).toHaveBeenNthCalledWith(2, {
        userId: "u1",
        habitId: "h1",
        dayKey: { $lt: "2026-10-12" },
      });
    });

    it("usa a última leitura por livro na janela, independente da ordem recebida", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 200, period: GoalPeriod.WEEK }),
      );
      m.entryFind
        .mockResolvedValueOnce([
          lectureEntry("2026-10-14", [{ book: "A", page: 200 }]),
          lectureEntry("2026-10-12", [{ book: "A", page: 150 }]),
          lectureEntry("2026-10-13", [{ book: "A", page: 180 }]),
        ])
        .mockResolvedValueOnce([]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.LECTURE }),
      );

      expect(result.current).toBe(200);
      expect(result.pct).toBe(100);
    });

    it("usa a última leitura por livro do baseline, independente da ordem recebida", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 20, period: GoalPeriod.WEEK }),
      );
      m.entryFind
        .mockResolvedValueOnce([
          lectureEntry("2026-10-14", [{ book: "A", page: 320 }]),
        ])
        .mockResolvedValueOnce([
          lectureEntry("2026-10-10", [{ book: "A", page: 300 }]),
          lectureEntry("2026-10-01", [{ book: "A", page: 250 }]),
          lectureEntry("2026-10-05", [{ book: "A", page: 280 }]),
        ]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.LECTURE }),
      );

      expect(result.current).toBe(20);
      expect(result.pct).toBe(100);
    });

    it("aplica Math.max(0, ...) quando a página regride em relação ao baseline", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 10, period: GoalPeriod.WEEK }),
      );
      m.entryFind
        .mockResolvedValueOnce([
          lectureEntry("2026-10-14", [{ book: "A", page: 250 }]),
        ])
        .mockResolvedValueOnce([
          lectureEntry("2026-10-10", [{ book: "A", page: 300 }]),
        ]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.LECTURE }),
      );

      expect(result.current).toBe(0);
      expect(result.pct).toBe(0);
    });

    it("várias leituras do mesmo livro na mesma entry: a última vence", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 25, period: GoalPeriod.WEEK }),
      );
      m.entryFind
        .mockResolvedValueOnce([
          lectureEntry("2026-10-12", [
            { book: "A", page: 10 },
            { book: "A", page: 25 },
          ]),
        ])
        .mockResolvedValueOnce([]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.LECTURE }),
      );

      expect(result.current).toBe(25);
    });

    it("ignora leituras sem book ou page e não consulta o baseline se nada sobrar", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 10, period: GoalPeriod.WEEK }),
      );
      m.entryFind.mockResolvedValueOnce([
        lectureEntry("2026-10-12", [
          { book: null, page: 10 },
          { book: "A", page: null },
          { book: "B" },
          { page: 5 },
        ]),
        lectureEntry("2026-10-13", null),
        { dayKey: "2026-10-14" },
      ]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.LECTURE }),
      );

      expect(result.current).toBe(0);
      expect(result.unit).toBe("páginas");
      // Sem leituras válidas, nem chega a buscar o baseline.
      expect(m.entryFind).toHaveBeenCalledTimes(1);
    });

    it("só conta leituras válidas e ignora page nula ao lado de uma válida do mesmo livro", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 40, period: GoalPeriod.WEEK }),
      );
      m.entryFind
        .mockResolvedValueOnce([
          lectureEntry("2026-10-12", [
            { book: null, page: 10 },
            { book: "A", page: 40 },
            { book: "A", page: null },
          ]),
        ])
        .mockResolvedValueOnce([]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.LECTURE }),
      );

      expect(result.current).toBe(40);
      expect(result.pct).toBe(100);
    });

    it("sem leituras na janela: current 0 e não consulta o baseline", async () => {
      m.findOne.mockResolvedValue(
        goalDoc({ amount: 10, period: GoalPeriod.WEEK }),
      );
      m.entryFind.mockResolvedValueOnce([]);

      const result = await getGoalProgress(
        "u1",
        "h1",
        "g1",
        makeHabit({ type: HabitType.LECTURE }),
      );

      expect(result.current).toBe(0);
      expect(result.pct).toBe(0);
      expect(result.unit).toBe("páginas");
      expect(m.entryFind).toHaveBeenCalledTimes(1);
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
