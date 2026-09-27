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

// validate tem DUAS formas, e a segunda foi adicionada depois da primeira
// sem tirar a primeira. O branch e isZodSchema (validate.ts:11):
//
// - forma legada: recebe um ZodSchema que embrulha { body, query, params }
// - forma nova:   recebe um mapa { body?, query?, params? }
//
// As duas nao se equiparam: a mensagem de erro da legada nao nomeia a parte
// ("Validation failed"), a da nova nomeia ("Validation failed: body").
//
// Atenção: na forma legada so o body e reatribuido no req (linha 30).
// query e params sao validados, mas o parse NAO e aplicado. Isso e
// intencional (no Express so body e gravavel), mas precisa ficar fixado
// num teste: se alguem passar a reatribuir params, ninguem avisa.
describe("validateMiddleware", () => {
  // --- forma nova ---

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

  // --- forma legada ---

  it.todo("valida body e params de uma vez, pelo schema embrulhado");

  it.todo("reatribui so o body na forma legada, nunca query nem params");
});
