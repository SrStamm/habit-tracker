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
