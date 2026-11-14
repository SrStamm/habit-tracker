import { type Response, type Request } from "express";
import { APP_TIMEZONE } from "../../config/timeZone";

// Fuente de la zona de la aplicación para el front. El día de "hoy" no se
// expone: el front lo calcula con esta zona en cada render, y el servidor
// valida los días con su propio reloj.
export const handleGetConfig = async (_req: Request, res: Response) => {
  res.status(200).json({ timeZone: APP_TIMEZONE });
};
