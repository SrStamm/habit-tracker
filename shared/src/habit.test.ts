import { describe, it, expect } from "vitest";
import {
  CreateHabitSchema,
  HabitDeleteSchema,
  HabitUpdateSchema,
} from "./habit";

describe("CreateHabitSchema", () => {
  it("aceita um BOOLEAN sem target", () => {
    const result = CreateHabitSchema.safeParse({
      name: "Leer",
      type: "BOOLEAN",
    });
    expect(result.success).toBe(true);
  });

  // superRefine targetOnlyForMeasurable é a única regra que não está no type base.
  // Se ninguém o testea, apaga e o bug aparece
  // em producao com un target fantasma num BOOLEAN.
  it("rejeita target quando type é BOOLEAN", () => {
    const result = CreateHabitSchema.safeParse({
      name: "Lêr",
      type: "BOOLEAN",
      target: 1,
    });
    expect(result.success).toBe(false);
  });

  it("aceita target quanto o type é QUANTITY", () => {
    const result = CreateHabitSchema.safeParse({
      name: "Beber água",
      type: "QUANTITY",
      target: 5,
    });
    expect(result.success).toBe(true);
  });

  it("aceita target quando type é DURATION", () => {
    const result = CreateHabitSchema.safeParse({
      name: "Treinar",
      type: "DURATION",
      target: 40,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita target menor a 1", () => {
    const result = CreateHabitSchema.safeParse({
      name: "Treinar",
      type: "DURATION",
      target: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita name vacio", () => {
    const result = CreateHabitSchema.safeParse({
      name: "",
      type: "DURATION",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita name ausente", () => {
    const result = CreateHabitSchema.safeParse({
      type: "DURATION",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita type ausente", () => {
    const result = CreateHabitSchema.safeParse({
      name: "Treinar",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita type fora do enum", () => {
    const result = CreateHabitSchema.safeParse({
      name: "Treinar",
      type: "HELLLOOO",
    });
    expect(result.success).toBe(false);
  });

  // O schema usa .strict(), então uma key desconhecida é rejeitada em vez
  // de descartada. Sem isso, um typo como "targret" sumia em silêncio e o
  // cliente achava que tinha salvo.
  it("rejeita key desconhecida por causa do .strict()", () => {
    const result = CreateHabitSchema.safeParse({
      name: "Treinar",
      type: "DURATION",
      targret: 4,
    });
    expect(result.success).toBe(false);
  });
});

describe("HabitUpdateSchema", () => {
  // Cuidado: esta é a forma legada, o schema embrulha { body, query, params }.
  // O validate.ts ramifica sobre isso (isZodSchema). Um teste que passe só o
  // body pelado fica verde e não está testando o update.
  it("rejeita params sem habitId", () => {
    const result = HabitUpdateSchema.safeParse({
      body: { name: "Treinar na academia" },
    });
    expect(result.success).toBe(false);
  });

  it("aceita body vazio (patch sem mudanças)", () => {
    const result = HabitUpdateSchema.safeParse({
      body: {},
      params: { habitId: "asd" },
    });
    expect(result.success).toBe(true);
  });

  it("aceita target null, que é o sinal de unset", () => {
    const result = HabitUpdateSchema.safeParse({
      body: { target: null },
      params: { habitId: "asd" },
    });
    expect(result.success).toBe(true);
  });

  it("rejeita BOOLEAN com target no body", () => {
    const result = HabitUpdateSchema.safeParse({
      body: { type: "BOOLEAN", target: 10 },
      params: { habitId: "asd" },
    });
    expect(result.success).toBe(false);
  });

  // Atenção: o body do update NÃO é .strict(), só o CreateHabitSchema é.
  // Por isso uma key errada aqui é descartada em silêncio. E success: true
  // sozinho não prova nada: body vazio também dá true. Por isso o teste
  // precisa olhar o data, senão um regresso de strip passa verde.
  it("aceita mudar só o name, sem type nem target", () => {
    const result = HabitUpdateSchema.safeParse({
      body: { name: "Treinar na academia" },
      params: { habitId: "asd" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toEqual({ name: "Treinar na academia" });
    }
  });
});

describe("HabitDeleteSchema", () => {
  it("aceita um habitId normal", () => {
    const result = HabitDeleteSchema.safeParse({ habitId: "1" });
    expect(result.success).toBe(true);
  });

  it("habitId vacio não pasa validação", () => {
    const result = HabitDeleteSchema.safeParse({ habitId: "" });
    expect(result.success).toBe(false);
  });
});
