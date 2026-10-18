import { describe, it, vi, expect } from "vitest";
import { type Response, type Request } from "express";
import {
  handleCreateEntry,
  handleGetEntries,
  handleGetAllEntries,
} from "./entry.controller";
import { upsertEntry, getEntries, getAllEntries } from "./entry.service";
import { HabitType } from "@habits/shared/habit";

// Contrato HTTP dos handlers de entry: código de estado + forma do JSON.
// Mock do service (nunca do modelo) — a lógica do service pertence a
// entry.service.test.ts.
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

    expect(res.json).toHaveBeenCalledWith({
      error: "Validation failed: body",
      issues: [
        {
          code: "invalid_type",
          expected: "boolean",
          message: "Invalid input: expected boolean, received undefined",
          path: ["completed"],
        },
        {
          code: "unrecognized_keys",
          keys: ["value"],
          message: 'Unrecognized key: "value"',

          path: [],
        },
      ],
    });
  });

  it("400 + { error } quando upsertEntry lança", async () => {
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

    vi.mocked(upsertEntry).mockRejectedValue(new Error("Falha Base de Dados"));

    await handleCreateEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Falha Base de Dados" });
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
      query: { from: undefined, to: undefined },
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

  it("converte req.query.from e req.query.to para Date antes de chamar getEntries", async () => {
    const query = {
      from: "2026-10-01",
      to: "2026-10-18",
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
      new Date("2026-10-01"),
      new Date("2026-10-18"),
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
      query: { from: undefined, to: undefined },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(getEntries).mockResolvedValue([entry]);

    await handleGetEntries(req, res);

    expect(getEntries).toHaveBeenCalledWith("u1", "h1", undefined, undefined);
  });

  it("400 + { error } quando getEntries lança", async () => {
    const req = {
      userId: "u1",
      params: { habitId: "h1" },
      query: { from: undefined, to: undefined },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(getEntries).mockRejectedValue(new Error("Falha Base de Dados"));

    await handleGetEntries(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Falha Base de Dados" });
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
      query: { from: undefined, to: undefined },
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

  it("converte req.query.from e req.query.to para Date e passa habitId", async () => {
    const query = {
      from: "2026-10-01",
      to: "2026-10-18",
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
      new Date("2026-10-01"),
      new Date("2026-10-18"),
      query.habitId,
    );
  });

  it("400 + { error } quando getAllEntries lança", async () => {
    const req = {
      userId: "u1",
      query: { from: undefined, to: undefined },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.mocked(getAllEntries).mockRejectedValue(
      new Error("Falha Base de Dados"),
    );

    await handleGetAllEntries(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Falha Base de Dados" });
  });
});
