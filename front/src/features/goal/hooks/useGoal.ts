import {
  CreateGoalDTO,
  GoalProgressResponseDTO,
  GoalResponseDTO,
  ParamsGoalDTO,
} from "@habits/shared/goal";
import { useState } from "react";
import { createGoal, deleteGoal, getGoalProgress, getGoals } from "../api";

export const useGetGoals = (habitId: string) => {
  const [data, setData] = useState<GoalResponseDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (): Promise<GoalResponseDTO[] | undefined> => {
    if (isPending) return;

    setData(null);
    setIsPending(true);
    setError(null);

    try {
      const result = await getGoals(habitId);
      setData(result.goals);
      return result.goals;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  const removeLocal = (goalId: string) =>
    setData((prev) => prev?.filter((g) => g._id !== goalId) ?? null);

  return { data, error, isPending, mutate, removeLocal };
};
export const useCreateGoal = () => {
  const [data, setData] = useState<GoalResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    habitId: string,
    input: CreateGoalDTO,
  ): Promise<GoalResponseDTO | undefined> => {
    if (isPending) return;

    setData(null);
    setIsPending(true);
    setError(null);

    try {
      const result = await createGoal(habitId, input);
      setData(result);
      return result;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { data, error, isPending, mutate };
};
export const useDeleteGoal = () => {
  // mutate({ habitId, goalId }), devuelve true en éxito.

  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (input: ParamsGoalDTO): Promise<boolean | undefined> => {
    if (isPending) return;

    setIsPending(true);
    setError(null);

    try {
      await deleteGoal(input);
      return true;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { error, isPending, mutate };
};
export const useGetGoalProgress = () => {
  // mutate(habitId, goalId), guarda el progress.
  const [data, setData] = useState<GoalProgressResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    input: ParamsGoalDTO,
  ): Promise<GoalProgressResponseDTO | undefined> => {
    if (isPending) return;

    setData(null);
    setIsPending(true);
    setError(null);

    try {
      const result = await getGoalProgress(input);
      setData(result);
      return result;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { data, error, isPending, mutate };
};
