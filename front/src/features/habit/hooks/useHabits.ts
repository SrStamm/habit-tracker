import {
  CreateHabitDTO,
  Habit,
  ParamsHabitDTO,
  UpdateHabitDTO,
} from "@habits/shared/habit";
import { useState } from "react";
import { archiveHabit, createHabit, getAllHabits, updateHabit } from "../api";

export const useCreateHabit = () => {
  const [data, setData] = useState<CreateHabitDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (input: CreateHabitDTO): Promise<Habit | undefined> => {
    if (isPending) return;

    setData(null);
    setIsPending(true);
    setError(null);

    try {
      const result = await createHabit(input);
      setData(result.novoHabito);
      return result.novoHabito;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { data, error, isPending, mutate };
};

export const useGetHabits = () => {
  const [data, setData] = useState<Habit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (): Promise<Habit[] | undefined> => {
    if (isPending) return;

    setData(null);
    setIsPending(true);
    setError(null);

    try {
      const result = await getAllHabits();
      setData(result.allHabits);
      return result.allHabits;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  const removeLocal = (habitId: string) =>
    setData((prev) => prev?.filter((h) => h._id !== habitId) ?? null);

  return { data, error, isPending, mutate, removeLocal };
};

export const useArchiveHabit = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    input: ParamsHabitDTO,
  ): Promise<boolean | undefined> => {
    if (isPending) return;

    setIsPending(true);
    setError(null);

    try {
      await archiveHabit(input);
      return true;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { error, isPending, mutate };
};

export const useUpdateHabit = () => {
  const [data, setData] = useState<Habit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    habitId: string,
    input: UpdateHabitDTO,
  ): Promise<Habit | undefined> => {
    if (isPending) return;

    setData(null);
    setIsPending(true);
    setError(null);

    try {
      const result = await updateHabit(habitId, input);
      setData(result.habitoAtualizado);
      return result.habitoAtualizado;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { data, error, isPending, mutate };
};
