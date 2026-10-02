import { describe, it, expect } from "vitest";
import {
  CreateHabitSchema,
  HabitParamsSchema,
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
      unit: "Lts",
    });
    expect(result.success).toBe(true);
  });

  it("aceita target quando type é DURATION", () => {
    const result = CreateHabitSchema.safeParse({
      name: "Treinar",
      type: "DURATION",
      target: 40,
      unit: "MINUTES",
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
  it("aceita body vazio (patch sem mudanças)", () => {
    const result = HabitUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("aceita target null, que é o sinal de unset", () => {
    const result = HabitUpdateSchema.safeParse({
      target: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita BOOLEAN com target no body", () => {
    const result = HabitUpdateSchema.safeParse({
      type: "BOOLEAN",
      target: 10,
    });
    expect(result.success).toBe(false);
  });

  // Atenção: o body do update NÃO é .strict(), só o CreateHabitSchema é.
  // Por isso uma key errada aqui é descartada em silêncio. E success: true
  // sozinho não prova nada: body vazio também dá true. Por isso o teste
  // precisa olhar o data, senão um regresso de strip passa verde.
  it("aceita mudar só o name, sem type nem target", () => {
    const result = HabitUpdateSchema.safeParse({
      name: "Treinar na academia",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: "Treinar na academia" });
    }
  });
});

describe("HabitParamsSchema", () => {
  it("aceita um habitId normal", () => {
    const result = HabitParamsSchema.safeParse({ habitId: "1" });
    expect(result.success).toBe(true);
  });

  it("habitId vacio não pasa validação", () => {
    const result = HabitParamsSchema.safeParse({ habitId: "" });
    expect(result.success).toBe(false);
  });
});
