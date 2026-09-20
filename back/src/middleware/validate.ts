import { type Request, type Response, type NextFunction } from "express";
import { type ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        issues: result.error.issues,
      });
    }

    req.body = result.data.body;
    // query y params son solo lectura en Express 5

    next();
  };
};
