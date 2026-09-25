import Entry from "../../models/Entry";
import { dayKeyFrom } from "../../lib/dayKey";
import { APP_TIMEZONE } from "../../config/timeZone";

const dayKeyRange = (from?: Date, to?: Date) => {
  if (!from && !to) return undefined;

  const range: Record<string, string> = {};
  if (from) range.$gte = dayKeyFrom(from, APP_TIMEZONE);
  if (to) range.$lte = dayKeyFrom(to, APP_TIMEZONE);
  return range;
};

export const getAllEntries = async (userId: string, from?: Date, to?: Date) => {
  const filter: Record<string, unknown> = { userId };
  const dayKey = dayKeyRange(from, to);
  if (dayKey) filter.dayKey = dayKey;
  return Entry.find(filter).sort({ dayKey: 1 });
};

export const getEntries = async (
  userId: string,
  habitId: string,
  from?: Date,
  to?: Date,
) => {
  const filter: Record<string, unknown> = { userId, habitId };
  const dayKey = dayKeyRange(from, to);
  if (dayKey) filter.dayKey = dayKey;
  return Entry.find(filter).sort({ dayKey: 1 });
};

const DUPLICATE_KEY = 11000;

const isDuplicateKey = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: number }).code === DUPLICATE_KEY;

export const upsertEntry = async (
  userId: string,
  habitId: string,
  value?: number,
  completed?: boolean,
  at?: Date,
) => {
  const dayKey = dayKeyFrom(at ?? new Date(), APP_TIMEZONE);
  const filter = { userId, habitId, dayKey };
  const update = { $set: { value, completed } };
  const options = {
    new: true,
    runValidators: true,
    includeResultMetadata: true,
  } as const;

  const apply = async (upsert: boolean) => {
    const { value: entry, lastErrorObject } = await Entry.findOneAndUpdate(
      filter,
      update,
      { ...options, upsert },
    );
    return { entry, updatedExisting: lastErrorObject?.updatedExisting ?? false };
  };

  try {
    return await apply(true);
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    return apply(false);
  }
};
