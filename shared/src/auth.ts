import { z } from "zod";
import { UserResponseSchema } from "./user";

export const LoginSchema = z.object({
  nome: z.string().min(1),
  password: z.string().min(8),
});

export type LoginDTO = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  token: z.string().min(1),
});

export type AuthResponseDTO = z.infer<typeof AuthResponseSchema>;

export const RegisterResponseSchema = z.object({
  user: UserResponseSchema,
  token: z.string(),
});

export type RegisterResponseDTO = z.infer<typeof RegisterResponseSchema>;
