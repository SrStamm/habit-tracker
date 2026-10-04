import { describe, expect, it } from "vitest";
import {
  buildCreateEntrySchema,
  GetAllEntriesQuerySchema,
  GetEntriesQuerySchema,
} from "./entry";
import { HabitType } from "./habit";

// Estes schemas são o contrato do POST /habits/:habitId/entries.
// Ao contrário de CreateHabitSchema, este É .strict(): uma key a mais
// é rejeitada em vez de descartada. Essa assimetria é intencional e precisa
// ser defendida com testes, não deixada ao acaso.
describe("buildCreateEntrySchema com HabitType.BOOLEAN", () => {
  const schema = buildCreateEntrySchema(HabitType.BOOLEAN);

  it("aceita completed booleano com dayKey", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      completed: true,
    });
    expect(result.success).toBe(true);
  });

  it("aceita dayKey, que é o contrato desde que a entry passou a ser por dia", () => {
    const result = schema.safeParse({ dayKey: "2026-01-01", completed: false });
    expect(result.success).toBe(true);
  });

  it("rejeita dayKey fora do formato YYYY-MM-DD", () => {
    const result = schema.safeParse({
      dayKey: "01-01-2026",
      completed: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita completed ausente", () => {
    const result = schema.safeParse({ dayKey: "2026-01-01" });
    expect(result.success).toBe(false);
  });

  it("rejeita completed como string", () => {
    const result = schema.safeParse({ dayKey: "2026-01-01", completed: "true" });
    expect(result.success).toBe(false);
  });

  it("rejeita value, porque BOOLEAN não leva value", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      completed: true,
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita uma key desconhecida, por ser .strict()", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      completed: true,
      target: 100,
    });
    expect(result.success).toBe(false);
  });

  // `at` era o contrato antigo (instante absoluto agrupado por APP_TIMEZONE).
  // Desde que a entry passou a ser uma-por-dia via dayKey, `at` deixou de
  // existir: rejeitá-lo aqui é o comportamento certo, não um regressão.
  it("rejeita at, porque a entry é por dayKey e não por instante", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      completed: true,
      at: "2026-01-01T10:00:00Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("buildCreateEntrySchema com QUANTITY e DURATION", () => {
  const schema = buildCreateEntrySchema(HabitType.DURATION);

  it("aceita value numérico", () => {
    const result = schema.safeParse({ dayKey: "2026-01-01", value: 1 });
    expect(result.success).toBe(true);
  });

  it("aceita value 0, pelo min ser 0 e não 1", () => {
    const result = schema.safeParse({ dayKey: "2026-01-01", value: 0 });
    expect(result.success).toBe(true);
  });

  it("rejeita value negativo", () => {
    const result = schema.safeParse({ dayKey: "2026-01-01", value: -1 });
    expect(result.success).toBe(false);
  });

  it("rejeita value como string, porque não há coerce", () => {
    const result = schema.safeParse({ dayKey: "2026-01-01", value: "0" });
    expect(result.success).toBe(false);
  });

  it("rejeita completed, porque QUANTITY e DURATION não levam completed", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      value: 0,
      completed: true,
    });
    expect(result.success).toBe(false);
  });

  it("DURATION gera o mesmo shape que QUANTITY", () => {
    const quantitySchema = buildCreateEntrySchema(HabitType.QUANTITY);
    expect(quantitySchema.shape).toEqual(schema.shape);
  });
});

describe("GetEntriesQuerySchema", () => {
  // Atenção: é z.coerce.date(), não z.date(). O front manda
  // filter.from.toISOString() (uma string) e por isso funciona. Sem o
  // coerce, GET /habits/entries?from=... seria um 400.
  it("coage from e to de string para Date", () => {
    const result = GetEntriesQuerySchema.safeParse({
      from: "2025-12-1",
      to: "2025-12-31",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita from com uma data inválida", () => {
    const result = GetEntriesQuerySchema.safeParse({
      from: "2025-12-32",
    });

    expect(result.success).toBe(false);
  });

  it("aceita query vazio, porque from e to são opcionais", () => {
    const result = GetEntriesQuerySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("aceita só from, sem to", () => {
    const result = GetEntriesQuerySchema.safeParse({
      from: "2025-12-1",
    });

    expect(result.success).toBe(true);
  });
});

// GET /habits/entries?habitId=&from=&to= — o habitId é opcional porque a
// home pede as entries de todos os hábitos para o heatmap geral.
describe("GetAllEntriesQuerySchema", () => {
  const habitId = "65f1c0e0a1b2c3d4e5f60718";

  it("aceita habitId como ObjectId de 24 chars", () => {
    const result = GetAllEntriesQuerySchema.safeParse({ habitId });
    expect(result.success).toBe(true);
  });

  it("aceita habitId junto com from e to", () => {
    const result = GetAllEntriesQuerySchema.safeParse({
      habitId,
      from: "2025-12-01",
      to: "2025-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("aceita query sem habitId, porque o filtro é opcional", () => {
    const result = GetAllEntriesQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejeita habitId que não é um ObjectId", () => {
    const result = GetAllEntriesQuerySchema.safeParse({ habitId: "nope" });
    expect(result.success).toBe(false);
  });

  it("rejeita habitId com 23 chars, para não mandar filter inválido ao Mongo", () => {
    const result = GetAllEntriesQuerySchema.safeParse({
      habitId: habitId.slice(0, 23),
    });
    expect(result.success).toBe(false);
  });
});
