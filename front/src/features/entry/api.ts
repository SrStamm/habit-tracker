import { CreateEntryDTO, Entry } from "@habits/shared/entry";
import { api } from "../../lib/api";

export const createEntry = async (
  input: CreateEntryDTO,
  habitId: string,
): Promise<{ newEntry: Entry }> => {
  const token = localStorage.getItem("token");
  return api(`/habits/${habitId}/entries`, {
    method: "POST",
    body: input,
    token,
  });
};
