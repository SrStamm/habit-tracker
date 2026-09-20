import { Router } from "express";
import { AuthSchema } from "./auth.types";
import { handleLogin, handleRegister } from "./auth.controller";
import { validate } from "../../middleware/validate";

const authRouter = Router();

authRouter.post("/login", validate(AuthSchema), handleLogin);

authRouter.post("/register", validate(AuthSchema), handleRegister);

export default authRouter;
