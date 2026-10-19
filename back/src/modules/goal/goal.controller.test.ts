import { describe, it, vi, expect, beforeEach } from "vitest";
import { type Request, type Response } from "express";
import {
  handleGetGoals,
  handleGetGoalProgress,
  handleCreateGoal,
  handleDeleteGoal,
} from "./goal.controller";
import {
  getGoals,
  getGoalProgress,
  createGoal,
  deleteGoal,
} from "./goal.service";
import { HabitType, type Habit } from "@habits/shared/habit";
import { GoalPeriod } from "@habits/shared/goal";
import { HttpError } from "../../lib/errors";

// Contrato HTTP dos handlers de goal: código de estado + forma do JSON.
// Mock do service (nunca do modelo) — a lógica do service pertence a
// goal.service.test.ts.
vi.mock("./goal.service");

// O habit é injetado no request por validateHabitOwner; aqui só precisa
// existir para handleGetGoalProgress repassá-lo ao service.
const habitFalso = {
  _id: "h1",
  userId: "u1",
  name: "hábito falso",
  type: HabitType.BOOLEAN,
  active: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
} as unknown as Habit;

const makeReq = (extra: Record<string, unknown> = {}) =>
  ({
    userId: "u1",
    params: { habitId: "h1", goalId: "g1" },
    body: {},
    habit: habitFalso,
    ...extra,
  }) as unknown as Request;

const makeRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  send: vi.fn().mockReturnThis(),
});

beforeEach(() => vi.clearAllMocks());

describe("handleGetGoals", () => {
  it("200 + { goals } (o controller envolve a lista no objeto)", async () => {
    const goals = [
      {
        _id: "g1",
        userId: "u1",
        habitId: "h1",
        amount: 5,
        period: GoalPeriod.WEEK,
      },
    ];
    vi.mocked(getGoals).mockResolvedValue(goals);

    const res = makeRes();
    await handleGetGoals(makeReq(), res as unknown as Response);

    expect(getGoals).toHaveBeenCalledWith("u1", "h1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ goals });
  });
});

describe("handleGetGoalProgress", () => {
  it("200 + o objeto progresso do service (sem envolver) e repassa req.habit", async () => {
    const progress = {
      goalId: "g1",
      amount: 7,
      current: 2,
      pct: (2 / 7) * 100,
      unit: "BOOLEAN",
      periodStart: "2026-10-12",
      periodEnd: "2026-10-18",
    };
    vi.mocked(getGoalProgress).mockResolvedValue(progress);

    const res = makeRes();
    await handleGetGoalProgress(makeReq(), res as unknown as Response);

    expect(getGoalProgress).toHaveBeenCalledWith(
      "u1",
      "h1",
      "g1",
      habitFalso,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(progress);
  });
});

describe("handleCreateGoal", () => {
  it("201 + o goal salvo (sem envolver) e repassa req.body ao service", async () => {
    const body = { amount: 5, period: GoalPeriod.WEEK };
    const saved = {
      _id: "g1",
      userId: "u1",
      habitId: "h1",
      amount: 5,
      period: GoalPeriod.WEEK,
    };
    vi.mocked(createGoal).mockResolvedValue(saved);

    const res = makeRes();
    await handleCreateGoal(makeReq({ body }), res as unknown as Response);

    expect(createGoal).toHaveBeenCalledWith("u1", "h1", body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(saved);
  });
});

describe("handleDeleteGoal", () => {
  it("204 + send() sem json no caso de sucesso", async () => {
    vi.mocked(deleteGoal).mockResolvedValue(undefined);

    const res = makeRes();
    await handleDeleteGoal(makeReq(), res as unknown as Response);

    expect(deleteGoal).toHaveBeenCalledWith("u1", "h1", "g1");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
  });
});

// O 400 de payload inválido e o 404/403 de posse do hábito vêm dos
// middlewares validate() e validateHabitOwner (já cobertos em
// back/src/middleware/validate.test.ts e auth.test.ts). Aqui testa-se o
// contrato do handler: propagar o statusCode do HttpError que o service
// (ou o middleware em integração) lançar, com fallback 500.
describe("mapeamento de erros (contrato comum aos 4 handlers)", () => {
  const cenarios = [
    {
      nome: "HttpError 404",
      erro: new HttpError("Goal não encontrado", 404),
      status: 404,
      mensagem: "Goal não encontrado",
    },
    {
      nome: "HttpError 403",
      erro: new HttpError("Hábito no encontrado", 403),
      status: 403,
      mensagem: "Hábito no encontrado",
    },
    {
      nome: "erro genérico",
      erro: new Error("Falha Base de Dados"),
      status: 500,
      mensagem: "Erro interno do servidor",
    },
  ];

  const alvos = [
    { nome: "handleGetGoals", handler: handleGetGoals, mock: getGoals },
    {
      nome: "handleGetGoalProgress",
      handler: handleGetGoalProgress,
      mock: getGoalProgress,
    },
    { nome: "handleCreateGoal", handler: handleCreateGoal, mock: createGoal },
    { nome: "handleDeleteGoal", handler: handleDeleteGoal, mock: deleteGoal },
  ];

  for (const alvo of alvos) {
    for (const cenario of cenarios) {
      it(`${alvo.nome}: ${cenario.nome} → ${cenario.status} + { error }`, async () => {
        vi.mocked(alvo.mock).mockRejectedValue(cenario.erro);

        const res = makeRes();
        await alvo.handler(makeReq(), res as unknown as Response);

        expect(res.status).toHaveBeenCalledWith(cenario.status);
        expect(res.json).toHaveBeenCalledWith({ error: cenario.mensagem });
      });
    }
  }
});
