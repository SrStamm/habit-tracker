import {
  CreateEntryDTO,
  Entry,
  GetEntriesQueryDTO,
} from "@habits/shared/entry";
import { useCallback, useEffect, useState } from "react";
import { createEntry, getAllEntries } from "../api";
import { useApiMutation } from "../../../lib/useApiMutation";

export const useEntries = () => {
  const { error, isPending, data, mutate } = useApiMutation(
    async (filter?: GetEntriesQueryDTO): Promise<Entry[]> => {
      const result = await getAllEntries(filter);
      return result.entries;
    },
  );

  return { data, error, isPending, mutate };
};

export const useCreateEntry = () => {
  const { error, isPending, data, mutate } = useApiMutation(
    async (input: {
      input: CreateEntryDTO;
      habitId: string;
    }): Promise<Entry> => {
      const result = await createEntry(input.input, input.habitId);
      return result.newEntry;
    },
  );

  return {
    data,
    error,
    isPending,
    mutate: (input: CreateEntryDTO, habitId: string) =>
      mutate({ input, habitId }),
  };
};

// Fetch de las entries de UN hábito para la ventana [hoy - days, hoy].
// A diferencia de useApiMutation (que bajo lock descarta llamadas
// concurrentes), aquí solo se descartan respuestas obsoletas: cambiar de
// rango a mitad de un fetch cancela el anterior y pide el nuevo.
export const useHabitEntries = (habitId: string, days: number) => {
  const [data, setData] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);

    setIsPending(true);
    setError(null);

    getAllEntries({ from, to }, habitId)
      .then((result) => {
        if (!cancelled) setData(result.entries);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setIsPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [habitId, days, refreshTick]);

  const refetch = useCallback(() => setRefreshTick((t) => t + 1), []);

  return { data, error, isPending, refetch };
};
