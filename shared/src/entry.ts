import { z } from "zod";
import { HabitType } from "./habit";

// offset: true aceita tanto `Z` como `+02:00`. O backend normaliza `at` para
// instante absoluto (new Date) e depois agrupa por APP_TIMEZONE, então
// um offset não compete com essa semântica: rejeitá-lo só deixava um 400
// esperando o dia que alguém registrasse um dia passado de um navegador
// não-UTC, que é exatamente o caso de uso de Entry por dia.
const base = { at: z.iso.datetime({ offset: true }).optional() };

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

export type Entry = {
  _id: string;
  userId: string;
  habitId: string;
  dayKey: string;
  value?: number;
  completed?: boolean;
};
