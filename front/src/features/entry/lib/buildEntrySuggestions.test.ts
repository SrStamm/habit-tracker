import { describe, expect, it } from "vitest";
import { Entry } from "@habits/shared/entry";
import { buildEntrySuggestions } from "./buildEntrySuggestions";

const makeEntry = (
  dayKey: string,
  extra: Partial<Pick<Entry, "workout" | "lecture">>,
): Entry => ({
  _id: dayKey,
  userId: "user-1",
  habitId: "habit-1",
  dayKey,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...extra,
});

describe("buildEntrySuggestions", () => {
  it("extrai nomes de exercícios e livros das entries", () => {
    const suggestions = buildEntrySuggestions([
      makeEntry("2026-01-02", {
        workout: [{ exercise: "Supino reto", sets: [{ reps: 8, weight: 60 }] }],
      }),
      makeEntry("2026-01-03", {
        lecture: [{ book: "Deep Work", chapter: "1", page: 10 }],
      }),
    ]);

    expect(suggestions.exercises).toEqual(["Supino reto"]);
    expect(suggestions.books).toEqual(["Deep Work"]);
  });

  it("remove duplicados ignorando maiúsculas/minúsculas e espaços", () => {
    const suggestions = buildEntrySuggestions([
      makeEntry("2026-01-02", {
        workout: [
          { exercise: "Supino reto", sets: [{ reps: 8, weight: 60 }] },
          { exercise: " supino RETO ", sets: [{ reps: 10, weight: 50 }] },
        ],
      }),
    ]);

    expect(suggestions.exercises).toEqual(["Supino reto"]);
  });

  it("ordena alfabeticamente em pt-BR", () => {
    const suggestions = buildEntrySuggestions([
      makeEntry("2026-01-02", {
        lecture: [
          { book: "Zen", chapter: "1", page: 1 },
          { book: "Água", chapter: "1", page: 1 },
          { book: "Bíblia", chapter: "1", page: 1 },
        ],
      }),
    ]);

    expect(suggestions.books).toEqual(["Água", "Bíblia", "Zen"]);
  });

  it("ignora nomes vazios e entries sem workout/lecture", () => {
    const suggestions = buildEntrySuggestions([
      makeEntry("2026-01-02", { workout: [] }),
      makeEntry("2026-01-03", {
        workout: [{ exercise: "   ", sets: [{ reps: 8, weight: 60 }] }],
      }),
      makeEntry("2026-01-04", {}),
    ]);

    expect(suggestions).toEqual({ exercises: [], books: [] });
  });
});
