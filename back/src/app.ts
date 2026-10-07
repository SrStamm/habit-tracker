import express, { Express } from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { habitRoutes } from "./modules/habit/habit.routes";
import { entryRoutes } from "./modules/entry/entry.routes";

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.use(authRoutes.basePath, authRoutes.router);
  app.use(habitRoutes.basePath, habitRoutes.router);
  app.use(entryRoutes.basePath, entryRoutes.router);

  return app;
}
