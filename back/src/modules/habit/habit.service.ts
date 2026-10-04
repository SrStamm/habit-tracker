import Habit from "../../models/Habit";
import { CreateHabitDTO, UpdateHabitDTO } from "@habits/shared/habit";

export const findAllHabits = async (userId: string) => {
  const allHabits = await Habit.find({ userId });
  if (!allHabits.length) return [];
  return allHabits;
};

export const findAllActiveHabits = async (userId: string) => {
  const allHabits = await Habit.find({ userId, active: true });
  if (!allHabits.length) return [];
  return allHabits;
};

export const createHabit = async (userId: string, data: CreateHabitDTO) => {
  const novoHabito = new Habit({
    userId,
    active: true,
    ...data,
  });
  return await novoHabito.save();
};

export const updateHabit = async (
  habitId: string,
  userId: string,
  data: UpdateHabitDTO,
) => {
  const { name, type, description, category, target, unit } = data;

  const setData: Record<string, any> = {};
  const unsetData: Record<string, any> = {};

  if (name !== undefined) setData.name = name;
  if (type !== undefined) setData.type = type;
  if (description !== undefined) setData.description = description;
  if (category !== undefined) setData.category = category;
  if (target === null) unsetData.target = 1;
  else if (target !== undefined) setData.target = target;

  if (unit !== undefined) setData.unit = unit;

  const update: Record<string, any> = {};
  if (Object.keys(setData).length > 0) update.$set = setData;
  if (Object.keys(unsetData).length > 0) update.$unset = unsetData;

  return await Habit.findOneAndUpdate({ _id: habitId, userId }, update, {
    returnDocument: "after",
  });
};

export const archiveHabit = async (habitId: string, userId: string) => {
  return await Habit.findOneAndUpdate(
    { _id: habitId, userId },
    { $set: { active: false } },
  );
};
