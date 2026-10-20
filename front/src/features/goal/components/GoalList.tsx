import { useEffect, useState } from "react";
import { useGetGoals } from "../hooks/useGoal";
import { getGoalProgress } from "../api";
import { GoalProgressResponseDTO } from "@habits/shared/goal";
import { GOAL_PERIOD_LABELS } from "../lib/periodLabels";

interface Props {
  habitId: string;
}

function GoalList({ habitId }: Props) {
  const [progressMap, setProgressMap] = useState<
    Record<string, GoalProgressResponseDTO>
  >({});
  const { mutate, data: goals } = useGetGoals(habitId);

  useEffect(() => {
    mutate();
  }, [habitId]);

  useEffect(() => {
    if (!goals) return;
    let cancelled = false;
    Promise.all(
      goals.map((g) =>
        getGoalProgress({ habitId, goalId: g._id }).then(
          (p) => [g._id, p] as const,
        ),
      ),
    ).then((pairs) => {
      if (!cancelled) setProgressMap(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [goals]);

  return (
    <div className="flex flex-col gap-4 p-6 border-b border-border/40">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Objetivos
      </span>

      {goals?.map((goal) => {
        const progress = progressMap[goal._id];
        if (!progress) return null; // aún sin datos de progress

        return (
          <div key={goal._id} className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-text-muted">
              <span>
                {GOAL_PERIOD_LABELS[goal.period]}: {progress.periodStart} –{" "}
                {progress.periodEnd}
              </span>
              <span>
                {progress.current} / {progress.amount} ·{" "}
                {Math.round(progress.pct)}%
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-background border border-border/40 overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(progress.pct, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default GoalList;
