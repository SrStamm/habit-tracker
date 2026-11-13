import { Workout } from "@habits/shared/workout";

export type SetDraft = { id: string; reps: string; weight: string };
export type ExerciseDraft = { id: string; exercise: string; sets: SetDraft[] };
export type WorkoutDraft = ExerciseDraft[];

const newId = (): string => crypto.randomUUID();

export const emptySet = (): SetDraft => ({
  id: newId(),
  reps: "",
  weight: "0",
});

export const duplicateSet = (set: SetDraft): SetDraft => ({
  id: newId(),
  reps: set.reps,
  weight: set.weight,
});

export const emptyExercise = (): ExerciseDraft => ({
  id: newId(),
  exercise: "",
  sets: [emptySet()],
});

export const toDraft = (workout: Workout): WorkoutDraft =>
  workout.map((exercise) => ({
    id: newId(),
    exercise: exercise.exercise,
    sets: exercise.sets.map((set) => ({
      id: newId(),
      reps: String(set.reps),
      weight: String(set.weight),
    })),
  }));

export const toWorkout = (draft: WorkoutDraft): Workout =>
  draft.map((exercise) => ({
    exercise: exercise.exercise.trim(),
    sets: exercise.sets.map((set) => ({
      reps: Number(set.reps),
      weight: Number(set.weight),
    })),
  }));

export const isSetValid = (set: SetDraft): boolean => {
  if (set.reps.trim() === "" || set.weight.trim() === "") return false;
  const reps = Number(set.reps);
  const weight = Number(set.weight);
  return Number.isInteger(reps) && reps >= 1 && weight >= 0;
};

export const isExerciseValid = (exercise: ExerciseDraft): boolean =>
  exercise.exercise.trim() !== "" && exercise.sets.every(isSetValid);

export const isWorkoutDraftValid = (draft: WorkoutDraft): boolean =>
  draft.length > 0 && draft.every(isExerciseValid);
