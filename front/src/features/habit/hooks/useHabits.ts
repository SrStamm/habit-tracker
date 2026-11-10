import {
  CreateHabitDTO,
  Habit,
  ParamsHabitDTO,
  UpdateHabitDTO,
} from "@habits/shared/habit";
import { archiveHabit, createHabit, getAllHabits, updateHabit } from "../api";
import { useApiMutation } from "../../../lib/useApiMutation";

export const useCreateHabit = () => {
  const { error, isPending, data, mutate } = useApiMutation(
    async (input: CreateHabitDTO): Promise<Habit> => {
      const result = await createHabit(input);
      return result.novoHabito;
    },
  );

  return { data, error, isPending, mutate };
};

export const useGetHabits = () => {
  const { error, isPending, data, setData, mutate } = useApiMutation(
    async (_input: void): Promise<Habit[]> => {
      const result = await getAllHabits();
      return result.allHabits;
    },
  );

  const removeLocal = (habitId: string) =>
    setData((prev) => prev?.filter((h) => h._id !== habitId) ?? null);

  return { data, error, isPending, mutate, removeLocal };
};

export const useArchiveHabit = () => {
  const { error, isPending, mutate } = useApiMutation(
    async (input: ParamsHabitDTO): Promise<boolean> => {
      await archiveHabit(input);
      return true;
    },
  );

  return { error, isPending, mutate };
};

export const useUpdateHabit = () => {
  const { error, isPending, data, mutate } = useApiMutation(
    async (data: {
      habitId: string;
      input: UpdateHabitDTO;
    }): Promise<Habit> => {
      const result = await updateHabit(data.habitId, data.input);
      return result.habitoAtualizado;
    },
  );

  return {
    data,
    error,
    isPending,
    mutate: (habitId: string, input: UpdateHabitDTO) =>
      mutate({ habitId, input }),
  };
};
