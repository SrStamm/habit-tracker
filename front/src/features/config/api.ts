import { api } from "../../lib/api";

export type AppConfig = { timeZone: string; today: string };

export const getAppConfig = (): Promise<AppConfig> => api("/config");
