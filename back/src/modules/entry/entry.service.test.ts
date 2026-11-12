import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateEntryDTO } from "@habits/shared/entry";

// Cria um mock para todas as funcoes usadas no service
const m = vi.hoisted(() => {
  return {
    sort: vi.fn(),
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
    aggregate: vi.fn(),
  };
});

vi.mock("../../models/Entry", () => {
  return {
    default: {
      find: m.find.mockReturnValue({ sort: m.sort }),
      findOneAndUpdate: m.findOneAndUpdate,
      aggregate: m.aggregate,
    },
  };
});

import {
  getAllEntries,
  getEntries,
  getRecords,
  upsertEntry,
} from "./entry.service";
import { dayKeyFrom } from "../../lib/dayKey";
import { Types } from "mongoose";

// ============================================================
// getAllEntries(userId, from?, to?, habitId?) — heatmap da home
// ============================================================
describe("getAllEntries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("filtra só por { userId } e NÃO inclui dayKey quando não há from/to", async () => {
    const data = [{ _id: "e1", userId: "u1" }];
    m.sort.mockResolvedValue(data);

    const result = await getAllEntries("u1");

    expect(m.find).toHaveBeenCalledWith({ userId: "u1" });
    expect(result).toBe(data);
  });

  it("com habitId no query, inclui { userId, habitId } no filtro", async () => {
    const data = [{ _id: "e1", userId: "u1", habitId: "h1" }];
    m.sort.mockResolvedValue(data);

    const result = await getAllEntries("u1", undefined, undefined, "h1");

    expect(m.find).toHaveBeenCalledWith({ userId: "u1", habitId: "h1" });
    expect(result).toBe(data);
  });

  it("converte from/to em dayKey { $gte, $lte } com APP_TIMEZONE", async () => {
    const data = [{ _id: "e1", userId: "u1" }];
    const from = new Date("2026-03-10T12:00:00Z");
    const to = new Date("2026-03-12T12:00:00Z");

    m.sort.mockResolvedValue(data);

    await getAllEntries("u1", from, to);

    expect(m.find).toHaveBeenCalledWith({
      userId: "u1",
      dayKey: { $gte: "2026-03-10", $lte: "2026-03-12" },
    });
  });

  it("só 'from' -> só $gte; só 'to' -> só $lte", async () => {
    const data = [{ _id: "e1", userId: "u1" }];
    const from = new Date("2026-03-10T12:00:00Z");
    const to = new Date("2026-03-12T12:00:00Z");

    m.sort.mockResolvedValue(data);

    await getAllEntries("u1", from);

    expect(m.find).toHaveBeenCalledWith({
      userId: "u1",
      dayKey: { $gte: "2026-03-10" },
    });

    await getAllEntries("u1", undefined, to);

    expect(m.find).toHaveBeenCalledWith({
      userId: "u1",
      dayKey: { $lte: "2026-03-12" },
    });
  });

  it("ordena ascendente com .sort({ dayKey: 1 })", async () => {
    m.sort.mockResolvedValue([]);

    await getAllEntries("u1");

    expect(m.sort).toHaveBeenCalledWith({ dayKey: 1 });
  });
});

// ============================================================
// getEntries(userId, habitId, from?, to?) — entries de um hábito
// ============================================================
describe("getEntries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("filtra SEMPRE por { userId, habitId }", async () => {
    const data = [{ _id: "e1", userId: "u1", habitId: "h1" }];
    m.sort.mockResolvedValue(data);

    const result = await getEntries("u1", "h1");

    expect(m.find).toHaveBeenCalledWith({ userId: "u1", habitId: "h1" });
    expect(result).toBe(data);
  });

  it("converte from/to em dayKey { $gte, $lte } com APP_TIMEZONE", async () => {
    const data = [{ _id: "e1", userId: "u1", habitId: "h1" }];
    const from = new Date("2026-03-10T12:00:00Z");
    const to = new Date("2026-03-12T12:00:00Z");
    m.sort.mockResolvedValue(data);

    const result = await getEntries("u1", "h1", from, to);

    expect(m.find).toHaveBeenCalledWith({
      userId: "u1",
      habitId: "h1",
      dayKey: { $gte: "2026-03-10", $lte: "2026-03-12" },
    });
    expect(result).toBe(data);
  });

  it("ordena ascendente com .sort({ dayKey: 1 })", async () => {
    m.sort.mockResolvedValue([]);

    await getEntries("u1", "h1");

    expect(m.sort).toHaveBeenCalledWith({ dayKey: 1 });
  });
});

// ============================================================
// upsertEntry(userId, habitId, input) — a lógica condicional do ticket
// MOCK: findOneAndUpdate devolve { value: doc, lastErrorObject: {...} }
// ============================================================
describe("upsertEntry", () => {
  beforeEach(() => vi.clearAllMocks());

  // --- caminho feliz ---
  it("BOOLEAN: chama findOneAndUpdate 1x com upsert: true e $set { completed }", async () => {
    // O input do Entry a ingresar
    const input: CreateEntryDTO = { dayKey: "2026-03-10", completed: false };

    // O valor retornado

    const saved = {
      _id: "e1",
      userId: "u1",
      habitId: "h1",
      dayKey: "2026-03-10",
      completed: false,
    };
    m.findOneAndUpdate.mockResolvedValue({
      value: saved,
      lastErrorObject: { updatedExisting: false },
    });

    const result = await upsertEntry("u1", "h1", input);

    expect(m.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(m.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: "u1", habitId: "h1", dayKey: "2026-03-10" },
      { $set: { completed: false } },
      {
        runValidators: true,
        includeResultMetadata: true,
        returnDocument: "after",
        upsert: true,
      },
    );
    expect(result).toEqual({ entry: saved, updatedExisting: false });
  });

  it("QUANTITY: chama com upsert: true e $set { value } (sem completed)", async () => {
    const input: CreateEntryDTO = { dayKey: "2026-03-10", value: 10 };

    const saved = {
      _id: "e1",
      userId: "u1",
      habitId: "h1",
      dayKey: "2026-03-10",
      value: 10,
    };
    m.findOneAndUpdate.mockResolvedValue({
      value: saved,
      lastErrorObject: { updatedExisting: false },
    });

    const result = await upsertEntry("u1", "h1", input);

    expect(m.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(m.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: "u1", habitId: "h1", dayKey: "2026-03-10" },
      { $set: { value: 10 } },
      {
        runValidators: true,
        includeResultMetadata: true,
        returnDocument: "after",
        upsert: true,
      },
    );
    expect(result).toEqual({ entry: saved, updatedExisting: false });
  });

  it("updatedExisting: true vem do lastErrorObject.updatedExisting", async () => {
    const input: CreateEntryDTO = { dayKey: "2026-03-10", value: 10 };

    m.findOneAndUpdate.mockResolvedValue({
      value: {},
      lastErrorObject: { updatedExisting: true },
    });

    const result = await upsertEntry("u1", "h1", input);

    expect(m.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ entry: {}, updatedExisting: true });
  });

  it("sem lastErrorObject -> updatedExisting cai no default false", async () => {
    const input: CreateEntryDTO = { dayKey: "2026-03-10", value: 10 };

    m.findOneAndUpdate.mockResolvedValue({
      value: {},
    });

    const result = await upsertEntry("u1", "h1", input);

    expect(m.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ entry: {}, updatedExisting: false });
  });

  // --- o coração do ticket: o retry em chave duplicada ---
  it("code 11000 -> repete UMA vez com upsert: false (segunda chamada)", async () => {
    const input: CreateEntryDTO = { dayKey: "2026-03-10", completed: false };
    const saved = { _id: "e1", dayKey: "2026-03-10", completed: false };

    const dup = Object.assign(new Error("E11000 duplicate key"), {
      code: 11000,
    });

    m.findOneAndUpdate.mockRejectedValueOnce(dup).mockResolvedValueOnce({
      value: saved,
      lastErrorObject: { updatedExisting: true },
    });

    await upsertEntry("u1", "h1", input);

    expect(m.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(m.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      { userId: "u1", habitId: "h1", dayKey: "2026-03-10" },
      { $set: { completed: false } },
      expect.objectContaining({ upsert: false }),
    );
  });

  it("retry com documento -> retorna { entry: docDoRetry } (não o da 1ª chamada)", async () => {
    const input: CreateEntryDTO = { dayKey: "2026-03-10", completed: false };
    const docRetry = { _id: "e2", dayKey: "2026-03-10", completed: false };

    const dup = Object.assign(new Error("E11000"), { code: 11000 });

    m.findOneAndUpdate.mockRejectedValueOnce(dup).mockResolvedValueOnce({
      value: docRetry,
      lastErrorObject: { updatedExisting: true },
    });

    const result = await upsertEntry("u1", "h1", input);

    expect(result.entry).toBe(docRetry);
  });

  it("erro ≠ 11000 -> propaga e NÃO repete (findOneAndUpdate chamado 1x)", async () => {
    const input: CreateEntryDTO = { dayKey: "2026-03-10", completed: false };

    m.findOneAndUpdate.mockRejectedValue(new Error("connection lost"));

    await expect(upsertEntry("u1", "h1", input)).rejects.toThrow(
      "connection lost",
    );
    expect(m.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });

  it("retry devolve entry null -> lança Error explícito, nunca retorna { entry: null }", async () => {
    const input: CreateEntryDTO = { dayKey: "2026-03-10", completed: false };

    const dup = Object.assign(new Error("E11000"), { code: 11000 });

    m.findOneAndUpdate
      .mockRejectedValueOnce(dup)
      .mockResolvedValueOnce({
        value: null,
        lastErrorObject: { updatedExisting: false },
      });

    await expect(upsertEntry("u1", "h1", input)).rejects.toThrow(
      "Falha ao gravar a entry",
    );
    expect(m.findOneAndUpdate).toHaveBeenCalledTimes(2);
  });
});

// ============================================================
// getRecords(userId, habitId) — records pessoais de treino
// ============================================================
describe("getRecords", () => {
  // "u1"/"h1" não são hex de 24 caracteres: new Types.ObjectId lança
  // antes de chegar ao aggregate. As fixtures precisam de ids válidos.
  const USER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
  const HABIT_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";

  beforeEach(() => vi.clearAllMocks());

  it("filtra com ObjectId no $match e usa $top por peso/reps no $group", async () => {
    m.aggregate.mockResolvedValue([]);

    await getRecords(USER_ID, HABIT_ID);

    expect(m.aggregate).toHaveBeenCalledTimes(1);
    const pipeline = m.aggregate.mock.calls[0][0] as Array<{
      $match: { userId: unknown; habitId: unknown };
    }>;

    // Mongoose NÃO converte campos dentro de aggregate(): sem ObjectId
    // real o $match do Mongo não encontra nada (silenciosamente).
    const match = pipeline[0].$match;
    expect(match.userId).toBeInstanceOf(Types.ObjectId);
    expect(match.habitId).toBeInstanceOf(Types.ObjectId);
    expect(String(match.userId)).toBe(USER_ID);
    expect(String(match.habitId)).toBe(HABIT_ID);

    expect(pipeline.slice(1)).toEqual([
      { $unwind: "$workout" },
      { $unwind: "$workout.sets" },
      {
        $group: {
          _id: "$workout.exercise",
          top: {
            $top: {
              sortBy: { "workout.sets.weight": -1, "workout.sets.reps": -1 },
              output: {
                maxWeight: "$workout.sets.weight",
                reps: "$workout.sets.reps",
                dayKey: "$dayKey",
              },
            },
          },
        },
      },
      { $sort: { "top.maxWeight": -1 } },
    ]);
  });

  it("mapeia _id/top para { exercise, maxWeight, reps, dayKey }", async () => {
    m.aggregate.mockResolvedValue([
      {
        _id: "Supino reto",
        top: { maxWeight: 100, reps: 8, dayKey: "2026-11-01" },
      },
      {
        _id: "Agachamento",
        top: { maxWeight: 140, reps: 5, dayKey: "2026-10-20" },
      },
    ]);

    const result = await getRecords(USER_ID, HABIT_ID);

    expect(result).toEqual([
      {
        exercise: "Supino reto",
        maxWeight: 100,
        reps: 8,
        dayKey: "2026-11-01",
      },
      {
        exercise: "Agachamento",
        maxWeight: 140,
        reps: 5,
        dayKey: "2026-10-20",
      },
    ]);
  });

  it("aggregate sem linhas -> [] (hábito sem treinos)", async () => {
    m.aggregate.mockResolvedValue([]);

    const result = await getRecords(USER_ID, HABIT_ID);

    expect(result).toEqual([]);
  });

  it("erro do aggregate propaga sem responder", async () => {
    const erro = new Error("connection lost");
    m.aggregate.mockRejectedValue(erro);

    await expect(getRecords(USER_ID, HABIT_ID)).rejects.toBe(erro);
  });
});
