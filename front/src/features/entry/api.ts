import {
  CreateEntryDTO,
  Entry,
  GetEntriesQueryDTO,
} from "@habits/shared/entry";
import { api } from "../../lib/api";

const createURL = (filter?: GetEntriesQueryDTO, habitId?: string): string => {
  const url = habitId ? `/habits/${habitId}/entries` : "/habits/entries";
  if (!filter) return url;

  const params = new URLSearchParams();

  if (filter.from) {
    params.append("from", filter.from.toISOString());
  }

  if (filter.to) {
    params.append("to", filter.to.toISOString());
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

export const createEntry = async (
  input: CreateEntryDTO,
  habitId: string,
): Promise<{ newEntry: Entry }> => {
  return api(`/habits/${habitId}/entries`, {
    method: "POST",
    body: input,
  });
};

export const getAllEntries = async (
  filter?: GetEntriesQueryDTO,
  habitId?: string,
): Promise<{ entries: Entry[] }> => {
  const url = createURL(filter, habitId);

  return api(url, { method: "GET" });
};
