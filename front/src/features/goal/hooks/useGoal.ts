import {
  CreateGoalDTO,
  GoalProgressResponseDTO,
  GoalResponseDTO,
  ParamsGoalDTO,
} from "@habits/shared/goal";
import { createGoal, deleteGoal, getGoalProgress, getGoals } from "../api";
import { useApiMutation } from "../../../lib/useApiMutation";

export const useGetGoals = (habitId: string) => {
  const { error, isPending, data, setData, mutate } = useApiMutation(
    async (_input: void): Promise<GoalResponseDTO[]> => {
      const result = await getGoals(habitId);
      return result.goals;
    },
  );

  const removeLocal = (goalId: string) =>
    setData((prev) => prev?.filter((g) => g._id !== goalId) ?? null);

  return { data, error, isPending, mutate, removeLocal };
};

export const useCreateGoal = () => {
  const { error, isPending, data, mutate } = useApiMutation(
    async (input: {
      habitId: string;
      input: CreateGoalDTO;
    }): Promise<GoalResponseDTO> => {
      const result = await createGoal(input.habitId, input.input);
      return result;
    },
  );

  return {
    data,
    error,
    isPending,
    mutate: (habitId: string, input: CreateGoalDTO) =>
      mutate({ habitId, input }),
  };
};

export const useDeleteGoal = () => {
  const { error, isPending, mutate } = useApiMutation(
    async (input: ParamsGoalDTO): Promise<boolean> => {
      await deleteGoal(input);
      return true;
    },
  );

  return { error, isPending, mutate };
};

export const useGetGoalProgress = () => {
  const { error, isPending, data, mutate } = useApiMutation(
    async (input: ParamsGoalDTO): Promise<GoalProgressResponseDTO> => {
      return await getGoalProgress(input);
    },
  );

  return { data, error, isPending, mutate };
};
