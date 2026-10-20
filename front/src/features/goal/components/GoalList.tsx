import { useEffect, useState } from "react";
import { useCreateGoal, useGetGoals } from "../hooks/useGoal";
import { getGoalProgress } from "../api";
import { GoalPeriod, GoalProgressResponseDTO } from "@habits/shared/goal";
import { GOAL_PERIOD_LABELS } from "../lib/periodLabels";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";

interface Props {
  habitId: string;
}

function GoalList({ habitId }: Props) {
  const [progressMap, setProgressMap] = useState<
    Record<string, GoalProgressResponseDTO>
  >({});
  const { mutate, data: goals } = useGetGoals(habitId);
  const { mutate: mutateCreate, isPending: isPendingCreate } = useCreateGoal();
  const [amount, setAmount] = useState<number>(1);
  const [period, setPeriod] = useState<GoalPeriod>(GoalPeriod.MONTH);

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

  const handleSubmit = async () => {
    const created = await mutateCreate(habitId, { amount, period });

    if (created) {
      mutate();
    }
  };

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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-row items-center justify-center gap-2"
      >
        <Label htmlFor="goal-amount">Valor:</Label>

        <Input
          id="goal-amount"
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(Number(e.target.value));
          }}
        />

        <Label htmlFor="goal-period">Periodo:</Label>
        <Select
          id="goal-period"
          required
          value={period}
          onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
        >
          {Object.values(GoalPeriod).map((goalPeriod) => (
            <option key={goalPeriod} value={goalPeriod}>
              {GOAL_PERIOD_LABELS[goalPeriod]}
            </option>
          ))}
        </Select>

        <Button
          size="sm"
          disabled={isPendingCreate || !amount || amount < 1}
          className="text-xs"
          type="submit"
        >
          {isPendingCreate ? "Criando" : "Criar"}
        </Button>
      </form>
    </div>
  );
}

export default GoalList;
