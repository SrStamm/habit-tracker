import { describe, it, vi, expect } from "vitest";
import { type Response, type Request } from "express";
import {
  handleCreateEntry,
  handleGetEntries,
  handleGetAllEntries,
  handleGetRecords,
} from "./entry.controller";
import {
  upsertEntry,
  getEntries,
  getAllEntries,
  getRecords,
} from "./entry.service";
import { HabitType } from "@habits/shared/habit";

// Contrato HTTP dos handlers de entry: código de estado + forma do JSON.
// Mock do service (nunca do modelo) — a lógica do service pertence a
// entry.service.test.ts.
//
// Erros: os handlers não capturam mais — o contrato é PROPAGAR a rejeição
// (Express 5 encaminha ao errorHandler). O mapeamento erro → status é
// coberto em src/middleware/errorHandler.test.ts.
vi.mock("./entry.service");

describe("handleCreateEntry", () => {
  it("201 + { newEntry } quando updatedExisting === false", async () => {
    const habitMocked = {
      userId: "u1",
      habitId: "h1",
      name: "nameFalso",
      type: HabitType.BOOLEAN.toString(),
      active: true,
    };

    const inputData = {
      dayKey: "2026-10-18",
      completed: true,
    };

    const newEntry = {
      ...inputData,
      userId: "u1",
      habitId: "h1",
      _id: "e1",
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      habit: habitMocked,
      body: inputData,
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(upsertEntry).mockResolvedValue({
      entry: newEntry,
      updatedExisting: false,
    });

    await handleCreateEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ newEntry });
    expect(upsertEntry).toHaveBeenCalledWith("u1", "h1", inputData);
  });

  it("200 + { newEntry } quando updatedExisting === true", async () => {
    const habitMocked = {
      userId: "u1",
      habitId: "h1",
      name: "nameFalso",
      type: HabitType.BOOLEAN.toString(),
      active: true,
    };

    const inputData = {
      dayKey: "2026-10-18",
      completed: true,
    };

    const newEntry = {
      ...inputData,
      userId: "u1",
      habitId: "h1",
      _id: "e1",
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      habit: habitMocked,
      body: inputData,
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(upsertEntry).mockResolvedValue({
      entry: newEntry,
      updatedExisting: false,
    });

    await handleCreateEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ newEntry });
    expect(upsertEntry).toHaveBeenCalledWith("u1", "h1", inputData);
  });

  it("não chama upsertEntry quando a validação falha", async () => {
    const habitMocked = {
      userId: "u1",
      habitId: "h1",
      name: "nameFalso",
      type: HabitType.BOOLEAN.toString(),
      active: true,
    };

    const inputData = {
      dayKey: "2026-10-18",
      value: 1,
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      habit: habitMocked,
      body: inputData,
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await handleCreateEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(upsertEntry).not.toHaveBeenCalled();
  });

  it("400 + { error: 'Validation failed: body', issues } quando buildCreateEntrySchema falha", async () => {
    const habitMocked = {
      userId: "u1",
      habitId: "h1",
      name: "nameFalso",
      type: HabitType.BOOLEAN.toString(),
      active: true,
    };

    const inputData = {
      dayKey: "2026-10-18",
      value: 1,
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      habit: habitMocked,
      body: inputData,
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await handleCreateEntry(req, res);

    // A escrita é a união `at` | `dayKey`: nenhuma das ramas casa, então o
    // erro é um invalid_union com o motivo de cada rama.
    expect(res.json).toHaveBeenCalledWith({
      error: "Validation failed: body",
      issues: [
        {
          code: "invalid_union",
          path: [],
          message: "Invalid input",
          errors: [
            [
              {
                code: "invalid_type",
                expected: "string",
                path: ["at"],
                message: "Invalid input: expected string, received undefined",
              },
              {
                code: "invalid_type",
                expected: "boolean",
                path: ["completed"],
                message: "Invalid input: expected boolean, received undefined",
              },
              {
                code: "unrecognized_keys",
                keys: ["dayKey", "value"],
                path: [],
                message: 'Unrecognized keys: "dayKey", "value"',
              },
            ],
            [
              {
                code: "invalid_type",
                expected: "boolean",
                path: ["completed"],
                message: "Invalid input: expected boolean, received undefined",
              },
              {
                code: "unrecognized_keys",
                keys: ["value"],
                path: [],
                message: 'Unrecognized key: "value"',
              },
            ],
          ],
        },
      ],
    });
  });

  it("rejeita com o erro do service sem responder (errorHandler decide o status)", async () => {
    const habitMocked = {
      userId: "u1",
      habitId: "h1",
      name: "nameFalso",
      type: HabitType.BOOLEAN.toString(),
      active: true,
    };

    const inputData = {
      dayKey: "2026-10-18",
      completed: true,
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      habit: habitMocked,
      body: inputData,
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new Error("Falha Base de Dados");
    vi.mocked(upsertEntry).mockRejectedValue(erro);

    await expect(handleCreateEntry(req, res)).rejects.toBe(erro);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("handleGetEntries", () => {
  it("200 + { entries } no caso de sucesso", async () => {
    const entry = {
      dayKey: "2026-10-18",
      completed: true,
      userId: "u1",
      habitId: "h1",
      _id: "e1",
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      query: { fromDayKey: undefined, toDayKey: undefined },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(getEntries).mockResolvedValue([entry]);

    await handleGetEntries(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ entries: [entry] });
  });

  it("passa req.query.fromDayKey/toDayKey como strings antes de chamar getEntries", async () => {
    const query = {
      fromDayKey: "2026-10-01",
      toDayKey: "2026-10-18",
    };

    const entry = {
      dayKey: "2026-10-18",
      completed: true,
      userId: "u1",
      habitId: "h1",
      _id: "e1",
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      query: { ...query },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(getEntries).mockResolvedValue([entry]);

    await handleGetEntries(req, res);

    expect(getEntries).toHaveBeenCalledWith(
      "u1",
      "h1",
      "2026-10-01",
      "2026-10-18",
    );
  });

  it("passa from/to como undefined quando não vêm no query", async () => {
    const entry = {
      dayKey: "2026-10-18",
      completed: true,
      userId: "u1",
      habitId: "h1",
      _id: "e1",
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      query: { fromDayKey: undefined, toDayKey: undefined },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(getEntries).mockResolvedValue([entry]);

    await handleGetEntries(req, res);

    expect(getEntries).toHaveBeenCalledWith("u1", "h1", undefined, undefined);
  });

  it("rejeita com o erro do service sem responder (errorHandler decide o status)", async () => {
    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      query: { fromDayKey: undefined, toDayKey: undefined },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new Error("Falha Base de Dados");
    vi.mocked(getEntries).mockRejectedValue(erro);

    await expect(handleGetEntries(req, res)).rejects.toBe(erro);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("handleGetAllEntries", () => {
  it("200 + { entries } no caso de sucesso", async () => {
    const entry = {
      dayKey: "2026-10-18",
      completed: true,
      userId: "u1",
      habitId: "h1",
      _id: "e1",
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const req = {
      userId: "u1",
      query: { fromDayKey: undefined, toDayKey: undefined },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(getAllEntries).mockResolvedValue([entry]);

    await handleGetAllEntries(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ entries: [entry] });
  });

  it("passa req.query.fromDayKey/toDayKey como strings e passa habitId", async () => {
    const query = {
      fromDayKey: "2026-10-01",
      toDayKey: "2026-10-18",
      habitId: "h1",
    };

    const entry = {
      dayKey: "2026-10-18",
      completed: true,
      userId: "u1",
      habitId: "h1",
      _id: "e1",
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const req = {
      userId: "u1",
      query: { ...query },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(getAllEntries).mockResolvedValue([entry]);

    await handleGetAllEntries(req, res);

    expect(getAllEntries).toHaveBeenCalledWith(
      "u1",
      "2026-10-01",
      "2026-10-18",
      query.habitId,
    );
  });

  it("rejeita com o erro do service sem responder (errorHandler decide o status)", async () => {
    const req = {
      userId: "u1",
      query: { fromDayKey: undefined, toDayKey: undefined },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new Error("Falha Base de Dados");
    vi.mocked(getAllEntries).mockRejectedValue(erro);

    await expect(handleGetAllEntries(req, res)).rejects.toBe(erro);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("handleGetRecords", () => {
  it("200 + { records } no caso de sucesso", async () => {
    const records = [
      {
        exercise: "Supino reto",
        maxWeight: 100,
        reps: 8,
        dayKey: "2026-11-01",
      },
    ];

    const req = {
      userId: "u1",
      params: { habitId: "h1" },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(getRecords).mockResolvedValue(records);

    await handleGetRecords(req, res);

    expect(getRecords).toHaveBeenCalledWith("u1", "h1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ records });
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
    vi.mocked(getRecords).mockRejectedValue(erro);

    await expect(handleGetRecords(req, res)).rejects.toBe(erro);
    expect(res.status).not.toHaveBeenCalled();
  });
});
