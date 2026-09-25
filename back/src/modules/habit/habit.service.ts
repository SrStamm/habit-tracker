import Habit from "../../models/Habit";
import { HabitType } from "@habits/shared/habit";

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
  target?: number,
) => {
  const novoHabito = new Habit({
    userId,
    name,
    description,
    category,
    type,
    target,
  });
  return await novoHabito.save();
};

export const updateHabit = async (
  habitId: string,
  name?: string,
  type?: HabitType,
  description?: string,
  category?: string,
  target?: number | null,
) => {
  const setData: Record<string, any> = {};
  const unsetData: Record<string, any> = {};

  if (name !== undefined) setData.name = name;
  if (type !== undefined) setData.type = type;
  if (description !== undefined) setData.description = description;
  if (category !== undefined) setData.category = category;
  if (target === null) unsetData.target = 1;
  else if (target !== undefined) setData.target = target;

  const update: Record<string, any> = {};
  if (Object.keys(setData).length > 0) update.$set = setData;
  if (Object.keys(unsetData).length > 0) update.$unset = unsetData;

  return await Habit.findOneAndUpdate({ _id: habitId }, update, {
    returnDocument: true,
  });
};

export const deleteHabit = async (habitId: string) => {
  return await Habit.findOneAndDelete({ _id: habitId });
};
