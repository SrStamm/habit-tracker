import { z } from "zod";

export const WorkoutSetSchema = z.object({
  reps: z.number().int().min(1),
  weight: z.number().min(0),
});

export const WorkoutExerciseSchema = z.object({
  exercise: z.string().min(1),
  sets: z.array(WorkoutSetSchema).min(1),
});

export type Workout = z.infer<typeof WorkoutExerciseSchema>[];

export const WorkoutRecordSchema = z.object({
  exercise: z.string(),
  maxWeight: z.number().min(0),
  reps: z.int().min(1),
  dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type WorkoutRecord = z.infer<typeof WorkoutRecordSchema>;

export const WorkoutRecordsResponseSchema = z.object({
  records: z.array(WorkoutRecordSchema),
});
