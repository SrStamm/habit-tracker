import { CreateHabitDTO, Habit } from "@habits/shared/habit";
import { useState } from "react";
import { createHabit, getAllHabits } from "../api";

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

  return { data, error, isPending, mutate };
};
