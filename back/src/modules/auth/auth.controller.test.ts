import { describe, expect, it, vi } from "vitest";
import { type Request, type Response } from "express";
import { createUser, firmarToken, validarUsuario } from "./auth.service";

import { handleLogin, handleRegister } from "./auth.controller";
import { HttpError } from "../../lib/errors";

// Contrato HTTP dos handlers de auth: código de estado + forma do JSON.
// Mock do service (nunca do modelo) — a lógica do service pertence a
// auth.service.test.ts.
//
// Erros: os handlers não capturam mais — o contrato é PROPAGAR a rejeição
// (Express 5 encaminha ao errorHandler). O mapeamento erro → status é
// coberto em src/middleware/errorHandler.test.ts.

vi.hoisted(() => {
  process.env.JWT_SECRET ??= "segredo-de-teste";
});

vi.mock("./auth.service");

describe("handleRegister", () => {
  it("201 + { user, token } quando o registo é bem-sucedido", async () => {
    const req = { body: { nome: "test", password: "test" } } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const userMocked = {
      _id: "id_falso",
      __v: 1,
      nome: "test",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const token = "token_falso";

    vi.mocked(createUser).mockResolvedValue(userMocked);
    vi.mocked(firmarToken).mockResolvedValue(token);

    await handleRegister(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ user: userMocked, token: token });
    expect(createUser).toHaveBeenCalledWith("test", "test");
  });

  it("chama firmarToken com user._id.toString()", async () => {
    const req = { body: { nome: "test", password: "test" } } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const userMocked = {
      _id: "id_falso",
      __v: 1,
      nome: "test",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(createUser).mockResolvedValue(userMocked);

    await handleRegister(req, res);

    expect(firmarToken).toHaveBeenCalledWith(userMocked._id.toString());
  });

  it("rejeita com o HttpError 409 quando o utilizador já existe (sem token)", async () => {
    const req = { body: { nome: "test", password: "test" } } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new HttpError("Usuario ja existe", 409);
    vi.mocked(createUser).mockRejectedValue(erro);

    await expect(handleRegister(req, res)).rejects.toBe(erro);
    expect(firmarToken).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejeita com o erro do service sem responder (errorHandler decide o status)", async () => {
    const req = { body: { nome: "test", password: "test" } } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new Error("Falha Base de Dados");
    vi.mocked(createUser).mockRejectedValue(erro);

    await expect(handleRegister(req, res)).rejects.toBe(erro);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("handleLogin", () => {
  it("200 + { token } quando as credenciais são válidas", async () => {
    const req = { body: { nome: "test", password: "test" } } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const userMocked = {
      _id: "id_falso",
      __v: 1,
      nome: "test",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const token = "token_falso";

    vi.mocked(validarUsuario).mockResolvedValue(userMocked);
    vi.mocked(firmarToken).mockResolvedValue(token);

    await handleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: token });
  });

  it("chama validarUsuario(nome, password) e firmarToken com user._id.toString()", async () => {
    const req = { body: { nome: "test", password: "test" } } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const userMocked = {
      _id: "id_falso",
      __v: 1,
      nome: "test",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(validarUsuario).mockResolvedValue(userMocked);
    vi.mocked(firmarToken).mockResolvedValue("token_falso");

    await handleLogin(req, res);

    expect(validarUsuario).toHaveBeenCalledWith("test", "test");
    expect(firmarToken).toHaveBeenCalledWith(userMocked._id.toString());
  });

  it("rejeita com o HttpError 401 quando as credenciais são erradas (sem token)", async () => {
    const req = { body: { nome: "test", password: "errado" } } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new HttpError("Credenciais inválidas", 401);
    vi.mocked(validarUsuario).mockRejectedValue(erro);

    await expect(handleLogin(req, res)).rejects.toBe(erro);
    expect(firmarToken).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejeita com o erro do service sem responder (errorHandler decide o status)", async () => {
    const req = { body: { nome: "test", password: "test" } } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const erro = new Error("Falha Base de Dados");
    vi.mocked(validarUsuario).mockRejectedValue(erro);

    await expect(handleLogin(req, res)).rejects.toBe(erro);
    expect(res.status).not.toHaveBeenCalled();
  });
});
