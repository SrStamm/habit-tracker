import {
  CreateEntryDTO,
  Entry,
  GetEntriesQueryDTO,
} from "@habits/shared/entry";
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
