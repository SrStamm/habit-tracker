import { Router } from "express";
import { handleGetConfig } from "./config.controller";

// Público: o front precisa da timezone antes de autenticar. Não usa authMiddleware.
const configRouter: Router = Router();

configRouter.get("/", handleGetConfig);

export const configRoutes = { basePath: "/config", router: configRouter };
