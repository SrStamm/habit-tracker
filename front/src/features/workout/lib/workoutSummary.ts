import { Workout } from "@habits/shared/workout";

export const workoutSummary = (workout?: Workout): string => {
  const list = workout ?? [];
  const exercises = list.length;
  if (exercises === 0) return "Pendente";

  const sets = list.reduce((sum, ex) => sum + ex.sets.length, 0);
  return `${exercises} ${exercises === 1 ? "exercício" : "exercícios"} · ${sets} ${sets === 1 ? "série" : "séries"}`;
};
