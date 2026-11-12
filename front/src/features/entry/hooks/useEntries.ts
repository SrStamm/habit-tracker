import {
  CreateEntryDTO,
  Entry,
  GetEntriesQueryDTO,
} from "@habits/shared/entry";
import { WorkoutRecord } from "@habits/shared/workout";
import { useCallback, useEffect, useState } from "react";
import { createEntry, getAllEntries, getWorkoutRecords } from "../api";
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

// Records personales (mejor peso por ejercicio) de un hábito WORKOUT.
// enabled=false no fetch: el hook queda en data=null / isPending=false /
// error=null (si se desactiva a mitad de vuelo, cancelled lo descarta).
export const useWorkoutRecords = (habitId: string, enabled: boolean) => {
  const [data, setData] = useState<WorkoutRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!enabled) {
      // Sin fetch: estado idle limpio (si se desactiva a mitad de vuelo,
      // el cleanup anterior marcó cancelled y aquí se limpia el resto).
      setData(null);
      setError(null);
      setIsPending(false);
      return;
    }

    let cancelled = false;

    setIsPending(true);
    setError(null);

    getWorkoutRecords(habitId)
      .then((result) => {
        if (!cancelled) setData(result.records);
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
  }, [habitId, enabled, refreshTick]);

  const refetch = useCallback(() => setRefreshTick((t) => t + 1), []);

  return { data, error, isPending, refetch };
};
