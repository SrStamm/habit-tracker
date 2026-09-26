import { type Request, type Response } from "express";
import { createUser, validarUsuario, firmarToken } from "./auth.service";

export const handleLogin = async (req: Request, res: Response) => {
  const { nome, password } = req.body;

  try {
    const user = await validarUsuario(nome, password);
    const token = await firmarToken(user._id.toString());
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const handleRegister = async (req: Request, res: Response) => {
  const { nome, password } = req.body;

  try {
    const user = await createUser(nome, password);
    const token = await firmarToken(user._id.toString());
    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
};
