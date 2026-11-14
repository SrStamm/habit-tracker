import Entry from "../../models/Entry";
import { dayKeyFrom } from "../../lib/dayKey";
import { APP_TIMEZONE } from "../../config/timeZone";
import { HttpError } from "../../lib/errors";
import { CreateEntryDTO } from "@habits/shared/entry";
import { WorkoutRecord } from "@habits/shared/workout";
import { Types } from "mongoose";

// As bordas já chegam como dias: nada de instante→dia aqui. O dia canônico
// só é decidido uma vez, na escrita (resolveDayKey).
const dayKeyRange = (fromDayKey?: string, toDayKey?: string) => {
  if (!fromDayKey && !toDayKey) return undefined;

  const range: Record<string, string> = {};
  if (fromDayKey) range.$gte = fromDayKey;
  if (toDayKey) range.$lte = toDayKey;
  return range;
};

export const getAllEntries = async (
  userId: string,
  fromDayKey?: string,
  toDayKey?: string,
  habitId?: string,
) => {
  const filter: Record<string, unknown> = { userId };
  if (habitId) filter.habitId = habitId;
  const dayKey = dayKeyRange(fromDayKey, toDayKey);
  if (dayKey) filter.dayKey = dayKey;
  return Entry.find(filter).sort({ dayKey: 1 });
};

export const getEntries = async (
  userId: string,
  habitId: string,
  fromDayKey?: string,
  toDayKey?: string,
) => {
  const filter: Record<string, unknown> = { userId, habitId };
  const dayKey = dayKeyRange(fromDayKey, toDayKey);
  if (dayKey) filter.dayKey = dayKey;
  return Entry.find(filter).sort({ dayKey: 1 });
};

// O día é do servidor, não do cliente: `at` é um instante qualquer e o dia
// sai de APP_TIMEZONE; `dayKey` é uma escolha explícita e é aceita como está,
// mas nunca no futuro (o "hoy" também é o do servidor).
export const resolveDayKey = (input: CreateEntryDTO): string => {
  const dayKey =
    "at" in input ? dayKeyFrom(new Date(input.at), APP_TIMEZONE) : input.dayKey;
  const today = dayKeyFrom(new Date(), APP_TIMEZONE);

  if (dayKey > today) {
    throw new HttpError("O dia da entry não pode estar no futuro", 400);
  }

  return dayKey;
};

const DUPLICATE_KEY = 11000;

const isDuplicateKey = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: number }).code === DUPLICATE_KEY;

export const upsertEntry = async (
  userId: string,
  habitId: string,
  input: CreateEntryDTO,
) => {
  const dayKey = resolveDayKey(input);
  const value = "value" in input ? input.value : undefined;
  const completed = "completed" in input ? input.completed : undefined;
  const workout = "workout" in input ? input.workout : undefined;
  const lecture = "lecture" in input ? input.lecture : undefined;

  const filter = { userId, habitId, dayKey };
  const update = { $set: { value, completed, workout, lecture } };
  const options = {
    runValidators: true,
    includeResultMetadata: true,
    returnDocument: "after",
  } as const;

  const apply = async (upsert: boolean) => {
    const { value: entry, lastErrorObject } = await Entry.findOneAndUpdate(
      filter,
      update,
      { ...options, upsert },
    );
    return {
      entry,
      updatedExisting: lastErrorObject?.updatedExisting ?? false,
    };
  };

  try {
    return await apply(true);
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;

    const result = await apply(false);

    // El reintento sin upsert solo sirve si el documento ya existia. Si tampoco
    // matchea, la escritura se perdio: devolver entry: null hacia al controller
    // un 201 con newEntry null, y el cliente creia que habia guardado.
    if (!result.entry) {
      throw new Error(
        "Falha ao gravar a entry: o upsert conflitou e nenhum documento corresponde ao filtro",
      );
    }

    return result;
  }
};

export const getRecords = async (
  userId: string,
  habitId: string,
): Promise<WorkoutRecord[]> => {
  const rows = await Entry.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        habitId: new Types.ObjectId(habitId),
      },
    },
    { $unwind: "$workout" },
    { $unwind: "$workout.sets" },
    {
      $group: {
        _id: "$workout.exercise",
        top: {
          $top: {
            sortBy: { "workout.sets.weight": -1, "workout.sets.reps": -1 },
            output: {
              maxWeight: "$workout.sets.weight",
              reps: "$workout.sets.reps",
              dayKey: "$dayKey",
            },
          },
        },
      },
    },
    { $sort: { "top.maxWeight": -1 } },
  ]);
  return rows.map((r) => ({ exercise: r._id, ...r.top }));
};
