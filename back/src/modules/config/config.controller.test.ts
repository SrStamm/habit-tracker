import { describe, it, vi, expect } from "vitest";
import { type Response, type Request } from "express";
import { handleGetConfig } from "./config.controller";
import { APP_TIMEZONE } from "../../config/timeZone";

// Contrato HTTP do /config: o front depende dele para saber qual é "hoje".
// Não assertamos uma data fixa: o teste flakearia na virada da meia-noite.
describe("handleGetConfig", () => {
  it("200 + { timeZone, today } com a timezone da aplicação", async () => {
    const req = {} as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await handleGetConfig(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      timeZone: APP_TIMEZONE,
      today: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
  });
});
