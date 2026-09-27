import { type Request, type Response, type NextFunction } from "express";
import { type ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

type ValidationPart = Partial<Record<RequestPart, ZodSchema>>;

export const validate = (input: ValidationPart) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Nova forma : mapa de schemas por parte ({ body: LoginSchema })
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
