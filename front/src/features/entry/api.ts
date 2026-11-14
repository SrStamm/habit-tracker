import {
  CreateEntryDTO,
  Entry,
  GetEntriesQueryDTO,
} from "@habits/shared/entry";
import { WorkoutRecord } from "@habits/shared/workout";
import { api } from "../../lib/api";

// A URL fala em dias canônicos (YYYY-MM-DD), os mesmos que o servidor usa
// no filtro. Nenhum instante do navegador entra aqui.
export const buildEntriesURL = (
  filter?: GetEntriesQueryDTO,
  habitId?: string,
): string => {
  const url = habitId ? `/habits/${habitId}/entries` : "/habits/entries";
  if (!filter) return url;

  const params = new URLSearchParams();

  if (filter.fromDayKey) {
    params.append("fromDayKey", filter.fromDayKey);
  }

  if (filter.toDayKey) {
    params.append("toDayKey", filter.toDayKey);
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
  const url = buildEntriesURL(filter, habitId);

  return api(url, { method: "GET" });
};

// Records personales de un hábito WORKOUT (mejor peso por ejercicio,
// ordenados por el backend de maxWeight desc).
export const getWorkoutRecords = async (
  habitId: string,
): Promise<{ records: WorkoutRecord[] }> => {
  return api(`/habits/${habitId}/records`, { method: "GET" });
};
