import { describe, expect, it } from "vitest";
import {
  buildCreateEntrySchema,
  GetEntriesQuerySchema,
  EntryParamsSchema,
} from "./entry";
import { HabitType } from "./habit";

// Estes schemas são o contrato do POST /habits/:habitId/entries.
// Ao contrário de CreateHabitSchema, este É .strict(): uma key a mais
// é rejeitada em vez de descartada. Essa assimetria é intencional e precisa
// ser defendida com testes, não deixada ao acaso.
describe("buildCreateEntrySchema com HabitType.BOOLEAN", () => {
  const schema = buildCreateEntrySchema(HabitType.BOOLEAN);

  it("acepta completed booleano", () => {
    const result = schema.safeParse({
      completed: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita completed ausente", () => {
    const result = schema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejeita completed como string", () => {
    const result = schema.safeParse({ completed: "true" });
    expect(result.success).toBe(false);
  });

  it("rejeita value, porque BOOLEAN não leva value", () => {
    const result = schema.safeParse({ completed: true, value: 100 });
    expect(result.success).toBe(false);
  });

  it("rejeita uma key desconhecida, por ser .strict()", () => {
    const result = schema.safeParse({ completed: true, target: 100 });
    expect(result.success).toBe(false);
  });

  // `at` aceita offset de propósito. Antes z.iso.datetime() vinha sem
  // { offset: true } e rejeitava qualquer datetime com timezone. Não
  // estourava porque o front nunca mandava `at` (HabitCard não inclui),
  // mas o backend já lidava bem: normaliza para instante absoluto e
  // agrupa por APP_TIMEZONE. O schema era o único mais restritivo que a
  // semântica do sistema.
  it("aceita at como ISO 8601 com Z", () => {
    const result = schema.safeParse({
      completed: true,
      at: "2026-01-01T10:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("aceita at com offset horário, não só UTC Z", () => {
    const result = schema.safeParse({
      completed: true,
      at: "2026-01-01T10:00:00+02:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita at date-only, porque não diz hora", () => {
    const result = schema.safeParse({
      completed: true,
      at: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita at sem timezone, porque não se sabe qual instante é", () => {
    const result = schema.safeParse({
      completed: true,
      at: "2026-01-01T10:00:00",
    });
    expect(result.success).toBe(false);
  });
});

describe("buildCreateEntrySchema com QUANTITY e DURATION", () => {
  const schema = buildCreateEntrySchema(HabitType.DURATION);

  it("aceita value numérico", () => {
    const result = schema.safeParse({ value: 1 });
    expect(result.success).toBe(true);
  });

  it("aceita value 0, pelo min ser 0 e não 1", () => {
    const result = schema.safeParse({ value: 0 });
    expect(result.success).toBe(true);
  });

  it("rejeita value negativo", () => {
    const result = schema.safeParse({ value: -1 });
    expect(result.success).toBe(false);
  });

  it("rejeita value como string, porque não há coerce", () => {
    const result = schema.safeParse({ value: "0" });
    expect(result.success).toBe(false);
  });

  it("rejeita completed, porque QUANTITY e DURATION não levam completed", () => {
    const result = schema.safeParse({ value: 0, completed: true });
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

describe("EntryParamsSchema", () => {
  it("aceita um habitId normal", () => {
    const result = EntryParamsSchema.safeParse({ habitId: "asfasf" });
    expect(result.success).toBe(true);
  });

  // Os três schemas de params já exigem .min(1): update, delete e entries.
  // Este teste trava esse comportamento. Se alguém reintroduzir um z.string()
  // pelado aqui, ele cai — e o gap volta em silêncio, porque um habitId vazio
  // só estouraria no meio da query do Mongo.
  it("detecta que habitId vazio é rejeitado na validação", () => {
    const result = EntryParamsSchema.safeParse({ habitId: "" });
    expect(result.success).toBe(false);
  });
});
