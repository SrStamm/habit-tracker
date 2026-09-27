import { describe, it, expect, vi } from "vitest";

// auth.ts importa verificarToken de auth.service, e auth.service tem um
// `const secret` a nivel de modulo (auth.service.ts:20) que TIRA no import
// se JWT_SECRET nao estiver definido. Sem o mock abaixo, este arquivo nao
// carrega: `pnpm test` morre antes de rodar um teste.
//
// O vi.mock e o que impede o modulo real de ser carregado. A alternativa
// e definir JWT_SECRET no vitest.config (test.env) e testar JWT de verdade
// com firmarToken: melhor cobertura, mas acopla o teste ao secret e traz
// jose para dentro do teste.

vi.mock("../modules/auth/auth.service", () => ({
  verificarToken: vi.fn(),
}));

import { authMiddleware } from "./auth";
import { verificarToken } from "../modules/auth/auth.service";
import { NextFunction, Request, Response } from "express";

const createMockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = vi.fn().mockReturnValue(res); // Retorna res para permitir encadenamiento
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

// CUIDADO: o catch de auth.ts (linha 26) nao distingue os erros. Token
// invalido, token expirado e "payload sem userId" (linha 19) caem todos no
// mesmo 401 "Token inválido ou expirado". Isso e aceitavel para nao vazar
// informacao, mas significa que o 401 nao diz POR QUE. Nao assumir mensagens
// diferentes por caso: a resposta e a mesma em todos.
describe("authMiddleware", () => {
  it("401 quando nao vem header Authorization", async () => {
    const req = {
      headers: {},
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token não proporcionado" });
  });

  it("401 quando o header nao usa o prefixo Bearer ", async () => {
    const req = {
      headers: { authorization: "token de prueba" },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token não proporcionado" });
  });

  it("401 quando verificarToken lanca (token invalido ou expirado)", async () => {
    const req = {
      headers: { authorization: "Bearer token_de_prueba" },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;
    vi.mocked(verificarToken).mockRejectedValue(
      new Error("Token inválido ou expirado"),
    );

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Token inválido ou expirado",
    });
  });

  it("401 quando o payload do token nao tem userId como string", async () => {
    const req = {
      headers: { authorization: "Bearer test_de_prueba" },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;
    vi.mocked(verificarToken).mockResolvedValue({});

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Token inválido ou expirado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("401 quando o payload do token tem userId vacío", async () => {
    const req = {
      headers: { authorization: "Bearer test_de_prueba" },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;
    vi.mocked(verificarToken).mockResolvedValue({ userId: "" });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Token inválido ou expirado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("atribui req.userId e chama next() quando o token e valido", async () => {
    const req = {
      headers: { authorization: "Bearer test_de_prueba" },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;
    vi.mocked(verificarToken).mockResolvedValue({ userId: "t1" });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
