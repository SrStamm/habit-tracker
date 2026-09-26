import { describe, expect, it } from "vitest";
import { UserResponseSchema } from "./user";

// Este schema existe por um único motivo: que o hash da password nunca
// vaze para o cliente. auth.service.ts hoje faz isso à mão com destructuring
// (const { password: _, ...userWithoutPassword } = saved.toObject()), ou seja
// que este schema hoje é a rede de segurança, não a proteção.
//
// Atenção: não há schema equivalente para a ENTRADA do user. O back valida
// o body de register com LoginSchema (auth.routes.ts), que só exige
// nome e password. O _id e o createdAt da request não têm schema.
describe("UserResponseSchema", () => {
  it("aceita nome e _id", () => {
    const result = UserResponseSchema.safeParse({
      nome: "hola",
      _id: "asdasf",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita user sem _id", () => {
    const result = UserResponseSchema.safeParse({
      nome: "hola",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita user sem nome", () => {
    const result = UserResponseSchema.safeParse({
      _id: "asdasf",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita nome não string", () => {
    const result = UserResponseSchema.safeParse({
      name: "hola",
      _id: "asdasf",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita _id não string", () => {
    const result = UserResponseSchema.safeParse({
      nome: "hola",
      _id: 12123,
    });
    expect(result.success).toBe(false);
  });

  // O strip da password é o comportamento que precisa ser fixado com um
  // teste. Se o Zod mudar de strip para passthrough, ou se alguém mudar o
  // schema, o hash vaza na resposta e o teste é o único que
  // detecta isso antes de um cliente.
  it("descarta a password do resultado em vez de propagá-la", () => {
    const result = UserResponseSchema.safeParse({
      nome: "hola",
      _id: "asfasf",
      password: "hellloo",
    });
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({ nome: "hola", _id: "asfasf" });
    }
  });
});
