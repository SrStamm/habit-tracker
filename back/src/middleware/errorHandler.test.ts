import { describe, it, expect, vi } from "vitest";
import { type Request, type Response, type NextFunction } from "express";
import mongoose from "mongoose";
import { errorHandler } from "./errorHandler";
import { HttpError } from "../lib/errors";

// Contrato do middleware central de erros: traduz cada classe de erro para
// um status HTTP honesto. Os controllers não capturam mais nada — Express 5
// encaminha as rejeições dos handlers async até aqui, então este arquivo é
// o único dono do mapeamento erro → status + { error }.

const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    headersSent: false,
  }) as unknown as Response;

const makeReq = () => ({}) as Request;

const makeNext = () => vi.fn() as NextFunction;

describe("errorHandler", () => {
  it("HttpError → statusCode próprio + { error }", async () => {
    const res = makeRes();
    const next = makeNext();

    await errorHandler(
      new HttpError("Goal não encontrado", 404),
      makeReq(),
      res,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Goal não encontrado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("CastError (ObjectId malformado) → 400 + mensagem limpa, sem vazar o interno do Mongo", async () => {
    const err = new mongoose.Error.CastError("ObjectId", "xyz", "habitId");
    const res = makeRes();
    const next = makeNext();

    await errorHandler(err, makeReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID inválido" });
    expect(JSON.stringify(res.json.mock.calls)).not.toContain("xyz");
    expect(next).not.toHaveBeenCalled();
  });

  it("ValidationError de Mongoose → 400 + { error }", async () => {
    const err = new mongoose.Error.ValidationError();
    err.addError(
      "target",
      new mongoose.Error.ValidatorError({ message: "Path `target` é obrigatório." }),
    );
    const res = makeRes();
    const next = makeNext();

    await errorHandler(err, makeReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: err.message });
    expect(next).not.toHaveBeenCalled();
  });

  it("erro desconhecido (outage de Mongo) → 500 + mensagem genérica, log no servidor", async () => {
    const err = new Error("MongoNetworkError: ECONNREFUSED 127.0.0.1:27017");
    const res = makeRes();
    const next = makeNext();
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await errorHandler(err, makeReq(), res, next);

    // O cliente não recebe detalhe interno; o servidor recebe o erro completo.
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erro interno do servidor" });
    expect(JSON.stringify(res.json.mock.calls)).not.toContain("ECONNREFUSED");
    expect(logSpy).toHaveBeenCalledWith(err);
    logSpy.mockRestore();
  });

  it("headers já enviados → delega ao default do Express via next(err)", async () => {
    const err = new Error("stream quebrou no meio");
    const res = { ...makeRes(), headersSent: true } as unknown as Response;
    const next = makeNext();

    await errorHandler(err, makeReq(), res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
