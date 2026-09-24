import Habit from "../../models/Habit";
import { HabitType } from "./habit.types";

export const findAllHabits = async (userId: string) => {
  const allHabits = await Habit.find({ userId });

  if (allHabits.length == 0 || allHabits == null) {
    return [];
  }

  return allHabits;
};

export const createHabit = async (
  userId: string,
  name: string,
  type: HabitType,
  description?: string,
  category?: string,
) => {
  const novoHabito = new Habit({ userId, name, description, category, type });
  return await novoHabito.save();
};

export const updateHabit = async (
  habitId: string,
  name?: string,
  type?: HabitType,
  description?: string,
  category?: string,
) => {
  const updateData: Record<string, any> = {};

  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;

  return await Habit.findOneAndUpdate(
    { _id: habitId },
    { $set: updateData },
    { returnDocument: true },
  );
};

export const deleteHabit = async (habitId: string) => {
  return await Habit.findOneAndDelete({ _id: habitId });
};
