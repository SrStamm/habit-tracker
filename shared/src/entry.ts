import { z } from "zod";
import { HabitType } from "./habit";

// offset: true aceita tanto `Z` como `+02:00`. O backend normaliza `at` para
// instante absoluto (new Date) e depois agrupa por APP_TIMEZONE, então
// um offset não compete com essa semântica: rejeitá-lo só deixava um 400
// esperando o dia que alguém registrasse um dia passado de um navegador
// não-UTC, que é exatamente o caso de uso de Entry por dia.
const base = { dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) };

export const buildCreateEntrySchema = (type: HabitType) =>
  type === HabitType.BOOLEAN
    ? z.object({ ...base, completed: z.boolean() }).strict()
    : z.object({ ...base, value: z.number().min(0) }).strict();

export type CreateEntryDTO = z.infer<ReturnType<typeof buildCreateEntrySchema>>;

export const GetEntriesQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type GetEntriesQueryDTO = z.infer<typeof GetEntriesQuerySchema>;

// ObjectId do Mongo. O filtro é opcional: sem habitId, o endpoint devolve
// entries de todos os hábitos do utilizador (é o que o heatmap da home usa).
// Só a rota global leva este schema; /habits/:habitId/entries recebe o hábito
// pelo path e não deve aceitar um habitId conflitante no query.
export const GetAllEntriesQuerySchema = GetEntriesQuerySchema.extend({
  habitId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "habitId must be a 24-char ObjectId")
    .optional(),
});
export type GetAllEntriesQueryDTO = z.infer<typeof GetAllEntriesQuerySchema>;

export const EntryResponseSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  habitId: z.string(),
  dayKey: z.string(),
  value: z.number().optional(),
  completed: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Entry = z.infer<typeof EntryResponseSchema>;
