import { CreateHabitDTO, Habit } from "@habits/shared/habit";
import { api } from "../../lib/api";

export const createHabit = async (
  data: CreateHabitDTO,
): Promise<{ novoHabito: Habit }> => {
  const token = localStorage.getItem("token");
  return api("/habits", { method: "POST", body: data, token });
};

export const getAllHabits = async (): Promise<{ allHabits: Habit[] }> => {
  const token = localStorage.getItem("token");
  return api("/habits", { method: "GET", token });
};
