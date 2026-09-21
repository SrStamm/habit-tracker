import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import { handleGetAllHabits } from "./habit.controller";

const habitRouter: Router = Router();
habitRouter.use(authMiddleware);

habitRouter.get("/", handleGetAllHabits);

export default habitRouter;
