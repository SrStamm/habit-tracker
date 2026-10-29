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
