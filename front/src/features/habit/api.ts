import { CreateHabitDTO, Habit } from "@habits/shared/habit";
import { api } from "../../lib/api";

export const createHabit = async (
  data: CreateHabitDTO,
): Promise<{ novoHabito: Habit }> => {
  return api("/habits", { method: "POST", body: data });
};

export const getAllHabits = async (): Promise<{ allHabits: Habit[] }> => {
  return api("/habits", { method: "GET" });
};
