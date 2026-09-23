import { z } from "zod";

export const LoginSchema = z.object({
  nome: z.string().min(1),
  password: z.string().min(8),
});

export type LoginDTO = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  token: z.string().min(1),
});
export type AuthResponseDTO = z.infer<typeof AuthResponseSchema>;
