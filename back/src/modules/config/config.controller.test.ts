import { describe, it, vi, expect } from "vitest";
import { type Response, type Request } from "express";
import { handleGetConfig } from "./config.controller";
import { APP_TIMEZONE } from "../../config/timeZone";

// Contrato HTTP del /config: el front depende de la zona para calcular el día.
describe("handleGetConfig", () => {
  it("200 + { timeZone } con la zona de la aplicación", async () => {
    const req = {} as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await handleGetConfig(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ timeZone: APP_TIMEZONE });
  });
});
