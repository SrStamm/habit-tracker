import {
  CreateEntryDTO,
  Entry,
  GetEntriesQueryDTO,
} from "@habits/shared/entry";
import { useState } from "react";
import { createEntry, getAllEntries } from "../api";

export const useEntries = () => {
  const [data, setData] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    filter?: GetEntriesQueryDTO,
    habitId?: string,
  ): Promise<Entry[] | undefined> => {
    if (isPending) return;

    setData(null);
    setIsPending(true);
    setError(null);

    try {
      const result = await getAllEntries(filter, habitId);
      setData(result.entries);
      return result.entries;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { data, error, isPending, mutate };
};

export const useCreateEntry = () => {
  const [data, setData] = useState<Entry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    input: CreateEntryDTO,
    habitId: string,
  ): Promise<Entry | undefined> => {
    if (isPending) return;

    setData(null);
    setIsPending(true);
    setError(null);

    try {
      const result = await createEntry(input, habitId);
      setData(result.newEntry);
      return result.newEntry;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { data, error, isPending, mutate };
};
