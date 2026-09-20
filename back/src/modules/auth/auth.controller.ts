import { type Request, type Response } from "express";
import { createUser } from "./auth.service";

export const handleLogin = (req: Request, res: Response) => {
  const { nome, password } = req.body;
};

export const handleRegister = async (req: Request, res: Response) => {
  const { nome, password } = req.body;

  try {
    const user = await createUser(nome, password);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
};
