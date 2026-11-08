import { Lecture } from "@habits/shared/lecture";

export type LectureDraftItem = {
  id: string;
  book: string;
  chapter: string;
  page: string;
};

export type LectureDraft = LectureDraftItem[];

const newId = (): string => crypto.randomUUID();

export const emptyLecture = (): LectureDraftItem => ({
  id: newId(),
  book: "",
  chapter: "",
  page: "",
});

export const toDraft = (lecture: Lecture): LectureDraft =>
  lecture.map((l) => ({
    id: newId(),
    book: l.book,
    chapter: l.chapter,
    page: String(l.page),
  }));

export const toLecture = (draft: LectureDraft): Lecture =>
  draft.map((item) => ({
    book: item.book.trim(),
    chapter: item.chapter.trim(),
    page: Number(item.page),
  }));

export const isLectureValid = (item: LectureDraftItem): boolean => {
  if (item.book.trim() === "" || item.chapter.trim() === "") return false;
  const page = Number(item.page);
  return Number.isInteger(page) && page >= 1;
};

export const isLectureDraftValid = (draft: LectureDraft): boolean =>
  draft.length > 0 && draft.every(isLectureValid);
