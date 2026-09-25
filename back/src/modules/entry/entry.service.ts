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

export const createEntry = async (
  userId: string,
  habitId: string,
  value?: number,
  completed?: boolean,
) => {
  const newEntry = new Entry({
    userId,
    habitId,
    value,
    completed,
    date: new Date(),
  });
  return newEntry.save();
};
