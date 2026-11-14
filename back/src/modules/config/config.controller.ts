import { type Response, type Request } from "express";
import { APP_TIMEZONE } from "../../config/timeZone";
import { dayKeyFrom } from "../../lib/dayKey";

// Fonte canônica de "qual dia é hoje" para o front. `timeZone` é a verdade;
// `today` é evidência/diagnóstico (o front recalcula em cada render para não
// congelar a virada da meia-noite).
export const handleGetConfig = async (_req: Request, res: Response) => {
  res.status(200).json({
    timeZone: APP_TIMEZONE,
    today: dayKeyFrom(new Date(), APP_TIMEZONE),
  });
};
