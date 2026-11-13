import { Entry } from "@habits/shared/entry";

export type EntrySuggestions = {
  exercises: string[];
  books: string[];
};

const dedupeSorted = (names: string[]): string[] => {
  const seen = new Map<string, string>();

  for (const raw of names) {
    const name = raw.trim();
    if (name === "") continue;

    const key = name.toLocaleLowerCase();
    if (!seen.has(key)) seen.set(key, name);
  }

  return [...seen.values()].sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
  );
};

export const buildEntrySuggestions = (entries: Entry[]): EntrySuggestions => ({
  exercises: dedupeSorted(
    entries.flatMap((entry) => entry.workout?.map((w) => w.exercise) ?? []),
  ),
  books: dedupeSorted(
    entries.flatMap((entry) => entry.lecture?.map((l) => l.book) ?? []),
  ),
});
