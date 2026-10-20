import {
  GoalResponseDTO,
  CreateGoalDTO,
  GoalProgressResponseDTO,
  ParamsGoalDTO,
} from "@habits/shared/goal";
import { api, apiVoid } from "../../lib/api";

export const getGoals = async (
  habitId: string,
): Promise<{ goals: GoalResponseDTO[] }> => {
  return api(`/habits/${habitId}/goals`, {
    method: "GET",
  });
};

export const getGoalProgress = async ({
  habitId,
  goalId,
}: ParamsGoalDTO): Promise<GoalProgressResponseDTO> => {
  return api(`/habits/${habitId}/goals/${goalId}/progress`, {
    method: "GET",
  });
};

export const createGoal = async (
  habitId: string,
  data: CreateGoalDTO,
): Promise<GoalResponseDTO> => {
  return api(`/habits/${habitId}/goals`, {
    method: "POST",
    body: data,
  });
};

export const deleteGoal = async ({
  habitId,
  goalId,
}: ParamsGoalDTO): Promise<void> => {
  return apiVoid(`/habits/${habitId}/goals/${goalId}`, {
    method: "DELETE",
  });
};
