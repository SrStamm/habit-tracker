import { type Request, type Response, type NextFunction } from "express";
import { type ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

type ValidationPart = Partial<Record<RequestPart, ZodSchema>>;

type SafeParseOutcome = { success: true; data: Record<RequestPart, unknown> } | { success: false; error: { issues: unknown[] } };

const isZodSchema = (value: unknown): value is ZodSchema =>
  typeof value === "object" && value !== null && "safeParse" in value;

export const validate = (input: ZodSchema | ValidationPart) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Forma legacy: el schema trae el envoltorio { body, query, params } adentro
    if (isZodSchema(input)) {
      const result = input.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as SafeParseOutcome;

      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          issues: result.error.issues,
        });
      }

      req.body = result.data.body;
      next();
      return;
    }

    // Forma nueva: mapa de schemas por parte ({ body: LoginSchema })
    for (const [part, schema] of Object.entries(input)) {
      if (!schema) continue;

      const result = schema.safeParse(req[part as RequestPart]);

      if (!result.success) {
        return res.status(400).json({
          error: `Validation failed: ${part}`,
          issues: result.error.issues,
        });
      }

      // body es grabable en Express; query y params son solo lectura
      if (part === "body") req.body = result.data;
    }

    next();
  };
};