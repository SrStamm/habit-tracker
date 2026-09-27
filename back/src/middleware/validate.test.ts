import { describe, it, expect, vi } from "vitest";
import { validate } from "./validate";
import { type Request, type Response, type NextFunction } from "express";
import { AuthResponseSchema } from "@habits/shared/auth";

const createMockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

const createMockReq = (
  parts: Partial<{ body: unknown; query: unknown; params: unknown }> = {},
) => ({ body: {}, query: {}, params: {}, ...parts }) as unknown as Request;

// validate recebe um mapa de schemas por parte: { body?, query?, params? }.
//
// A forma legada (um ZodSchema solto embrulhando { body, query, params }) foi
// removida: nenhuma rota a usava, e ela quebrava em silencio, porque so
// reatribuia req.body e descartava o parse de query e params. Nao reintroduzir.
//
// Restricao real do Express 5: req.query e req.params sao somente leitura, por
// isso so o body e reatribuido com o resultado do parse. query e params sao
// validados, mas nao transformados: um schema com coerce ali nao tem efeito
// no que o handler le.
describe("validateMiddleware", () => {
  it("chama next() quando todas as partes com schema sao validas", async () => {
    const req = createMockReq({ body: { token: "asfasf" } });
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    const middleware = validate({ body: AuthResponseSchema });
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("responde 400 com issues quando o body nao valida", () => {
    const req = createMockReq({ body: { tokenFalso: "asfasf" } });
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    const middleware = validate({ body: AuthResponseSchema });
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("nomeia a parte na mensagem de erro (Validation failed: body)", () => {
    const req = createMockReq({ body: {} });
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    const middleware = validate({ body: AuthResponseSchema });
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation failed: body" }),
    );
  });

  it("reatribui o body parseado no req.body", () => {
    // chaveExtra nao existe no schema: zod a descarta
    const req = createMockReq({ body: { token: "abc", chaveExtra: "some" } });
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    validate({ body: AuthResponseSchema })(req, res, next);

    expect(req.body).toEqual({ token: "abc" });
    expect(next).toHaveBeenCalledWith();
  });
});
