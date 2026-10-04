import {
  CreateHabitDTO,
  Habit,
  ParamsHabitDTO,
  UpdateHabitDTO,
} from "@habits/shared/habit";
import { api, apiVoid } from "../../lib/api";

export const createHabit = async (
  data: CreateHabitDTO,
): Promise<{ novoHabito: Habit }> => {
  return api("/habits", { method: "POST", body: data });
};

export const getAllHabits = async (): Promise<{ allHabits: Habit[] }> => {
  return api("/habits", { method: "GET" });
};

export const archiveHabit = async (params: ParamsHabitDTO): Promise<void> => {
  return apiVoid(`/habits/${params.habitId}`, { method: "DELETE" });
};

export const updateHabit = async (
  habitId: string,
  data: UpdateHabitDTO,
): Promise<{ habitoAtualizado: Habit }> => {
  return api(`/habits/${habitId}`, { method: "PATCH", body: data });
};
