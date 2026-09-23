import { Router } from "express";
import { LoginSchema } from "@habits/shared/auth";
import { handleLogin, handleRegister } from "./auth.controller";
import { validate } from "../../middleware/validate";

const authRouter = Router();

authRouter.post("/login", validate({ body: LoginSchema }), handleLogin);

authRouter.post("/register", validate({ body: LoginSchema }), handleRegister);

export default authRouter;
