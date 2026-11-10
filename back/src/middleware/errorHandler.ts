import { type Request, type Response, type NextFunction } from "express";
import mongoose from "mongoose";
import { HttpError } from "../lib/errors";

export const errorHandler = async (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. A resposta começou a se enviar -> delega no default de Express.
  //    Intentar enviar outro status aquí rompería o protocolo HTTP.
  if (res.headersSent) return next(err);

  // 2. Errores da app lanza a propósito: já tem status.
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // 3. ObjectId malformado ("/habits/xyz"): input inválido → 400,
  //    mas com mensagem limpo, não crudo de Mongo.
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: "ID inválido" });
  }

  // 4. Validação de schema Mongoose em .save() → 400.
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  // 5. Desconhecido (outage de Mongo, bug, etc):
  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor" });
};
