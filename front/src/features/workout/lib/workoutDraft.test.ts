import { describe, expect, it } from "vitest";
import { duplicateSet, emptySet } from "./workoutDraft";

describe("duplicateSet", () => {
  it("copia reps e peso da última série", () => {
    const set = { id: "set-1", reps: "8", weight: "60" };

    expect(duplicateSet(set)).toMatchObject({ reps: "8", weight: "60" });
  });

  it("gera um id novo para a série duplicada", () => {
    const set = { id: "set-1", reps: "8", weight: "60" };

    expect(duplicateSet(set).id).not.toBe(set.id);
  });

  it("mantém emptySet em branco", () => {
    expect(emptySet()).toMatchObject({ reps: "", weight: "0" });
  });
});
