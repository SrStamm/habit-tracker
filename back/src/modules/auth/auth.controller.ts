import { type Request, type Response } from "express";
import { createUser, validarUsuario, firmarToken } from "./auth.service";

export const handleLogin = async (req: Request, res: Response) => {
  const { nome, password } = req.body;

  const user = await validarUsuario(nome, password);
  const token = await firmarToken(user._id.toString());
  return res.status(200).json({ token });
};

export const handleRegister = async (req: Request, res: Response) => {
  const { nome, password } = req.body;

  const user = await createUser(nome, password);
  const token = await firmarToken(user._id.toString());
  return res.status(201).json({ user, token });
};
