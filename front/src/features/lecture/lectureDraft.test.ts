import { describe, expect, it } from "vitest";
import { isLectureDraftValid, type LectureDraftItem } from "./lectureDraft";

const lectureItem = (
  overrides: Partial<LectureDraftItem> = {},
): LectureDraftItem => ({
  id: "lecture-1",
  book: "Sapiens",
  chapter: "2",
  page: "40",
  ...overrides,
});

describe("isLectureDraftValid", () => {
  it("accepts an empty draft", () => {
    expect(isLectureDraftValid([])).toBe(true);
  });

  it("accepts one valid item", () => {
    expect(isLectureDraftValid([lectureItem()])).toBe(true);
  });

  it("rejects an item without a book", () => {
    expect(isLectureDraftValid([lectureItem({ book: "" })])).toBe(false);
  });

  it("rejects an item without a chapter", () => {
    expect(isLectureDraftValid([lectureItem({ chapter: "" })])).toBe(false);
  });

  it("rejects an item with page 0", () => {
    expect(isLectureDraftValid([lectureItem({ page: "0" })])).toBe(false);
  });

  it("rejects an item with a non-integer page", () => {
    expect(isLectureDraftValid([lectureItem({ page: "40.5" })])).toBe(false);
  });
});
