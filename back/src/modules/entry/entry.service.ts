import Entry from "../../models/Entry";
import Habit from "../../models/Habit";

export const validateUserHabit = async (userId: String, habitId: String) => {
  const habit = await Habit.findOne({ userId, _id: habitId });
  if (!habit) throw new Error("Hábito no encontrado");
};

export const getEntries = async (
  userId: String,
  habitId: String,
  from?: Date,
  to?: Date,
) => {
  const filter: Record<string, unknown> = { userId, habitId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }
  return Entry.find(filter).sort({ date: 1 });
};

export const createEntry = async (
  userId: String,
  habitId: String,
  value: String,
  completed: boolean,
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
