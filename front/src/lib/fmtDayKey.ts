import { dayKeyFrom } from "@habits/shared/dayKey";
import { getAppTimeZone } from "./appTimeZone";

// El "día" de la app lo define APP_TIMEZONE (vía /config), no la zona del navegador.
export const fmtDayKey = (d: Date): string => dayKeyFrom(d, getAppTimeZone());
