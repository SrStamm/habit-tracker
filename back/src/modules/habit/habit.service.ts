import Habit from "../../models/Habit";
import { HabitType } from "./habit.types";

export const findAllHabits = async (userId: string) => {
  const allHabits = await Habit.find({ userId });

  if (allHabits.length == 0 || allHabits == null) {
    throw new Error("Não se encontraram hábitos para o userId ingresado");
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
  userId: string,
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
    { userId, _id: habitId },
    { $set: updateData },
    { returnDocument: true },
  );
};

export const deleteHabit = async (userId: string, habitId: string) => {
  return await Habit.findOneAndDelete({ userId, _id: habitId });
};
