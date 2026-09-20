import { z } from "zod";

export const AuthSchema = z.object({
  body: z.object({
    nome: z.string().min(1),
    password: z.string().min(8),
  }),
});

export type AuthSchema = z.infer<typeof AuthSchema>;
