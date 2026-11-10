import { describe, it, vi, expect } from "vitest";
import {
  handleGetAllHabits,
  handleCreateHabit,
  handleUpdateHabit,
  handleArchiveHabit,
} from "./habit.controller";
import {
  findAllActiveHabits,
  findAllHabits,
  createHabit,
  updateHabit,
  archiveHabit,
} from "./habit.service";
import { HabitType } from "@habits/shared/habit";
import { type Request, type Response } from "express";

// Contrato HTTP dos handlers de habit: código de estado + forma do JSON.
// Mock do service (nunca do modelo) — a lógica do service pertence a
// habit.service.test.ts.
//
// Erros: os handlers não capturam mais — o contrato é PROPAGAR a rejeição
// (Express 5 encaminha ao errorHandler). O mapeamento erro → status é
// coberto em src/middleware/errorHandler.test.ts.
vi.mock("./habit.service");

describe("handleGetAllHabits", () => {
  it("200 + { allHabits } via findAllActiveHabits quando all !== 'true'", async () => {
    const req = {
      userId: "u1",
      query: { all: "false" },
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const habitsMocked = [
      {
        userId: "u1",
        name: "nameFalso",
        type: HabitType.BOOLEAN,
        active: true,
      },
    ];

    vi.mocked(findAllActiveHabits).mockResolvedValue(habitsMocked);

    await handleGetAllHabits(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ allHabits: habitsMocked });
    expect(findAllActiveHabits).toHaveBeenCalledWith("u1");
  });

  it("200 + { allHabits } via findAllHabits quando all === 'true'", async () => {
    const req = {
      userId: "u1",
      query: { all: "true" },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const habitsMocked = [
      {
        userId: "u1",
        name: "nameFalso",
        type: HabitType.BOOLEAN,
        active: true,
      },
    ];

    vi.mocked(findAllHabits).mockResolvedValue(habitsMocked);

    await handleGetAllHabits(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ allHabits: habitsMocked });
    expect(findAllHabits).toHaveBeenCalledWith("u1");
  });

  it("rejeita com o erro do service sem responder (errorHandler decide o status)", async () => {
    const req = {
      userId: "u1",
      query: { all: "true" },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new Error("Falha Base de Dados");
    vi.mocked(findAllHabits).mockRejectedValue(erro);

    await expect(handleGetAllHabits(req, res)).rejects.toBe(erro);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("handleCreateHabit", () => {
  it("201 + { novoHabito } no sucesso", async () => {
    const habitData = {
      name: "nameFalso",
      type: HabitType.BOOLEAN,
    };

    const habitMocked = {
      userId: "u1",
      ...habitData,
      active: true,
    };

    const req = {
      userId: "u1",
      body: habitData,
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(createHabit).mockResolvedValue(habitMocked);

    await handleCreateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      novoHabito: habitMocked,
    });
    expect(createHabit).toHaveBeenCalledWith("u1", {
      ...habitData,
      description: undefined,
      category: undefined,
      target: undefined,
      unit: undefined,
    });
  });

  it("rejeita com o erro do service sem responder (errorHandler decide o status)", async () => {
    const habitData = {
      name: "nameFalso",
      type: HabitType.BOOLEAN,
    };

    const req = {
      userId: "u1",
      body: habitData,
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new Error("Falha Base de Dados");
    vi.mocked(createHabit).mockRejectedValue(erro);

    await expect(handleCreateHabit(req, res)).rejects.toBe(erro);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("handleUpdateHabit", () => {
  it("201 + { habitoAtualizado } no sucesso", async () => {
    const habitData = {
      name: "nameFalso",
      type: HabitType.BOOLEAN,
    };

    const habitMocked = {
      userId: "u1",
      habitId: "h1",
      ...habitData,
      active: true,
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      body: habitData,
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(updateHabit).mockResolvedValue(habitMocked);

    await handleUpdateHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      habitoAtualizado: habitMocked,
    });
    expect(updateHabit).toHaveBeenCalledWith("h1", "u1", {
      ...habitData,
      description: undefined,
      category: undefined,
      target: undefined,
      unit: undefined,
    });
  });

  it("rejeita com o erro do service sem responder (errorHandler decide o status)", async () => {
    const habitData = {
      name: "nameFalso",
      type: HabitType.BOOLEAN,
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      body: habitData,
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new Error("Falha Base de Dados");
    vi.mocked(updateHabit).mockRejectedValue(erro);

    await expect(handleUpdateHabit(req, res)).rejects.toBe(erro);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("handleArchiveHabit", () => {
  it("204 sem corpo no sucesso", async () => {
    const habitMocked = {
      userId: "u1",
      habitId: "h1",
      name: "nameFalso",
      type: HabitType.BOOLEAN,
      active: false,
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(archiveHabit).mockResolvedValue(habitMocked);

    await handleArchiveHabit(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
    expect(archiveHabit).toHaveBeenCalledWith("h1", "u1");
  });

  it("rejeita com o erro do service sem responder (errorHandler decide o status)", async () => {
    const req = {
      userId: "u1",
      params: { habitId: "h1" },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new Error("Falha Base de Dados");
    vi.mocked(archiveHabit).mockRejectedValue(erro);

    await expect(handleArchiveHabit(req, res)).rejects.toBe(erro);
    expect(res.status).not.toHaveBeenCalled();
    expect(archiveHabit).toHaveBeenCalledWith("h1", "u1");
  });
});
