import express, { Express } from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { habitRoutes } from "./modules/habit/habit.routes";
import { entryRoutes } from "./modules/entry/entry.routes";
import { buildDocument } from "./docs/openapi";
import swaggerUi from "swagger-ui-express";
import "./docs/index";

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.use(authRoutes.basePath, authRoutes.router);
  app.use(habitRoutes.basePath, habitRoutes.router);
  app.use(entryRoutes.basePath, entryRoutes.router);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(buildDocument()));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
