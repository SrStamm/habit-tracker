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
//
// A escrita tem DUAS intenções de dia, nunca as duas ao mesmo tempo:
// `at` (instante; o servidor deriva o dia com APP_TIMEZONE) ou `dayKey`
// (dia escolhido explicitamente). A união estrutural defende isso.
describe("buildCreateEntrySchema com HabitType.BOOLEAN", () => {
  const schema = buildCreateEntrySchema(HabitType.BOOLEAN);

  it("aceita completed booleano com dayKey", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      completed: true,
    });
    expect(result.success).toBe(true);
  });

  it("aceita completed booleano com at (instante ISO)", () => {
    const result = schema.safeParse({
      at: "2026-01-01T10:00:00Z",
      completed: true,
    });
    expect(result.success).toBe(true);
  });

  it("aceita at com offset explícito (+02:00)", () => {
    const result = schema.safeParse({
      at: "2026-01-01T10:00:00+02:00",
      completed: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita at sem hora, porque não é um instante", () => {
    const result = schema.safeParse({
      at: "2026-01-01",
      completed: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita at e dayKey juntos", () => {
    const result = schema.safeParse({
      at: "2026-01-01T10:00:00Z",
      dayKey: "2026-01-01",
      completed: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quando não vem nem at nem dayKey", () => {
    const result = schema.safeParse({ completed: true });
    expect(result.success).toBe(false);
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
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      completed: "true",
    });
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

describe("buildCreateEntrySchema com WORKOUT", () => {
  const schema = buildCreateEntrySchema(HabitType.WORKOUT);

  it("daykey + workout com 1 exercise e 2 sets -> válido", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      workout: [
        {
          exercise: "Press banca",
          sets: [
            {
              reps: 12,
              weight: 30,
            },
            {
              reps: 8,
              weight: 50,
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("workout: [] -> inválido", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      workout: [],
    });

    expect(result.success).toBe(false);
  });

  it("Exercicio como sets: [] -> inválido", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      workout: [
        {
          exercise: "Press banca",
          sets: [],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("exercise vacío -> inválido", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      workout: [
        {
          exercise: "",
          sets: [
            {
              reps: 12,
              weight: 30,
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("reps: 2.5 -> inválido", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      workout: [
        {
          exercise: "Press banca",
          sets: [
            {
              reps: 12.2,
              weight: 30,
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("Enviar value em vez de workout -> inválido", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      value: [
        {
          exercise: "Press banca",
          sets: [
            {
              reps: 12,
              weight: 30,
            },
            {
              reps: 8,
              weight: 50,
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});

describe("buildCreateEntrySchema com LECTURE", () => {
  const schema = buildCreateEntrySchema(HabitType.LECTURE);

  it("aceita dayKey + lecture com 1 leitura", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      lecture: [{ book: "Sapiens", chapter: "2", page: 40 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejeita value, porque LECTURE leva lecture e não value", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      value: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita lecture: [] (min 1)", () => {
    const result = schema.safeParse({
      dayKey: "2026-01-01",
      lecture: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("GetEntriesQuerySchema", () => {
  // A query inteira fala em dias (YYYY-MM-DD). Não existe mais instante
  // aqui: converter no controller/service era a dupla conversão que corria
  // a borda da janela em fusos diferentes.
  it("aceita fromDayKey e toDayKey", () => {
    const result = GetEntriesQuerySchema.safeParse({
      fromDayKey: "2025-12-01",
      toDayKey: "2025-12-31",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita fromDayKey sem zero à esquerda", () => {
    const result = GetEntriesQuerySchema.safeParse({
      fromDayKey: "2025-12-1",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita fromDayKey com instante ISO no lugar de um dia", () => {
    const result = GetEntriesQuerySchema.safeParse({
      fromDayKey: "2025-12-01T10:00:00Z",
    });

    expect(result.success).toBe(false);
  });

  it("aceita query vazio, porque as bordas são opcionais", () => {
    const result = GetEntriesQuerySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("aceita só fromDayKey, sem toDayKey", () => {
    const result = GetEntriesQuerySchema.safeParse({
      fromDayKey: "2025-12-01",
    });

    expect(result.success).toBe(true);
  });
});

// GET /habits/entries?habitId=&fromDayKey=&toDayKey= — o habitId é opcional
// porque a home pede as entries de todos os hábitos para o heatmap geral.
describe("GetAllEntriesQuerySchema", () => {
  const habitId = "65f1c0e0a1b2c3d4e5f60718";

  it("aceita habitId como ObjectId de 24 chars", () => {
    const result = GetAllEntriesQuerySchema.safeParse({ habitId });
    expect(result.success).toBe(true);
  });

  it("aceita habitId junto com fromDayKey e toDayKey", () => {
    const result = GetAllEntriesQuerySchema.safeParse({
      habitId,
      fromDayKey: "2025-12-01",
      toDayKey: "2025-12-31",
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
