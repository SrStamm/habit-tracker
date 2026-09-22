import Entry from "../../models/Entry";
import Habit from "../../models/Habit";

export const validateUserHabit = async (userId: String, habitId: String) => {
  const habit = await Habit.findOne({ userId, _id: habitId });
  if (!habit) throw new Error("Hábito no encontrado");
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
