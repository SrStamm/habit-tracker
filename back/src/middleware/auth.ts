import { type Request, type Response, type NextFunction } from "express";
import { verificarToken } from "../modules/auth/auth.service";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não proporcionado" });
    }

    const token = header.split(" ")[1];
    const payload = await verificarToken(token);

    // Extender Request type para incluir userId
    (req as any).userId = payload.userId;

    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};
