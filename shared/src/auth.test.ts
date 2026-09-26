import { describe, it, expect } from "vitest";
import {
  LoginSchema,
  AuthResponseSchema,
  RegisterResponseSchema,
} from "./auth";

describe("LoginSchema", () => {
  it("aceita nome e password de 8 caracteres ou mais", () => {
    const result = LoginSchema.safeParse({
      nome: "hola",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita password de 7 caracteres, pelo min(8)", () => {
    const result = LoginSchema.safeParse({
      nome: "hola",
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita nome vazio, pelo min(1)", () => {
    const result = LoginSchema.safeParse({
      nome: "",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita body vazio", () => {
    const result = LoginSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejeita password ausente", () => {
    const result = LoginSchema.safeParse({
      nome: "hola",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita nome não string", () => {
    const result = LoginSchema.safeParse({
      name: "hola",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });
});

// Os três schemas seguintes NÃO são usados por ninguém: nem back nem front
// os importam. AuthResponseSchema, RegisterResponseSchema e UserResponseSchema
// existem, mas o back monta a resposta à mão no controller. Testa-os
// mesmo: são o contrato documentado do que o back deveria devolver,
// mas anota: hoje uma mudança na forma da resposta não quebra nenhum teste.
describe("AuthResponseSchema", () => {
  it("aceita um token não vazio", () => {
    const result = AuthResponseSchema.safeParse({
      token: "a",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita token vazio, pelo min(1)", () => {
    const result = AuthResponseSchema.safeParse({ token: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita token ausente", () => {
    const result = AuthResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("RegisterResponseSchema", () => {
  it("aceita user e token", () => {
    const result = RegisterResponseSchema.safeParse({
      user: { nome: "hola", _id: "gasf" },
      token: "asfasf",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita resposta sem token", () => {
    const result = RegisterResponseSchema.safeParse({
      user: { nome: "hola", _id: "gasf" },
    });
    expect(result.success).toBe(false);
  });

  it("rejeita resposta sem user", () => {
    const result = RegisterResponseSchema.safeParse({
      token: "asfasf",
    });
    expect(result.success).toBe(false);
  });

  it("descarta a password que venha aninhada em user", () => {
    const result = RegisterResponseSchema.safeParse({
      user: { nome: "hola", _id: "gasf", password: "123456" },
      token: "asfasf",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.user).toEqual({ nome: "hola", _id: "gasf" });
    }
  });
});
