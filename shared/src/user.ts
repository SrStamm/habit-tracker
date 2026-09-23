import { z } from "zod";

export const UserResponseSchema = z.object({
  nome: z.string(),
  _id: z.string(),
});

export type UserResponseDTO = z.infer<typeof UserResponseSchema>;
