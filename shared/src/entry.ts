import { z } from "zod";
import { HabitType } from "./habit";
import { WorkoutExerciseSchema } from "./workout";
import { LectureSchema } from "./lecture";

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// A escrita carrega uma intenção de dia, nunca uma adivinhação do cliente:
// - `at`: instante ISO; o servidor deriva o dia com APP_TIMEZONE (caso "hoje").
// - `dayKey`: dia escolhido explicitamente na UI (ex.: registrar ontem).
// A união garante exatamente uma das duas: mandar ambas ou nenhuma falha.
// offset: true aceita tanto `Z` como `+02:00`: o valor continua sendo um
// instante absoluto, e quem decide o dia é o servidor, não o offset.
const dayIntent = <T extends z.ZodRawShape>(payload: T) =>
  z.union([
    z.object({ at: z.iso.datetime({ offset: true }), ...payload }).strict(),
    z.object({ dayKey: z.string().regex(DAY_KEY_PATTERN), ...payload }).strict(),
  ]);

export const buildCreateEntrySchema = (type: HabitType) =>
  type === HabitType.BOOLEAN
    ? dayIntent({ completed: z.boolean() })
    : type === HabitType.WORKOUT
      ? dayIntent({ workout: z.array(WorkoutExerciseSchema).min(1) })
      : type === HabitType.LECTURE
        ? dayIntent({ lecture: z.array(LectureSchema).min(1) })
        : dayIntent({ value: z.number().min(0) });

export type CreateEntryDTO = z.infer<ReturnType<typeof buildCreateEntrySchema>>;

// As queries já falam em dias, não em instantes: o intervalo é o mesmo em
// qualquer fuso. A conversão instante→dia acontece uma única vez, na escrita.
export const GetEntriesQuerySchema = z.object({
  fromDayKey: z.string().regex(DAY_KEY_PATTERN).optional(),
  toDayKey: z.string().regex(DAY_KEY_PATTERN).optional(),
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
  workout: z.array(WorkoutExerciseSchema).optional(),
  lecture: z.array(LectureSchema).optional(),
  completed: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Entry = z.infer<typeof EntryResponseSchema>;
