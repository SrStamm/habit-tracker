import { z } from "zod";

export const LectureSchema = z
  .object({
    book: z.string().min(1),
    chapter: z.string().min(1),
    page: z.int().min(1),
  })
  .strict();

export type Lecture = z.infer<typeof LectureSchema>[];
