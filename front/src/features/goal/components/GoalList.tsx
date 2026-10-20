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
  const [showForm, setShowForm] = useState(false);

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
      setShowForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 border-b border-border/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Objetivos
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          type="button"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancelar" : "+ Novo objetivo"}
        </Button>
      </div>

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

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-row flex-wrap items-center gap-2">
            <Label htmlFor="goal-amount">Valor:</Label>

            <Input
              id="goal-amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => {
                setAmount(Number(e.target.value));
              }}
              className="flex-1 min-w-0 px-2 py-1 text-xs bg-background"
            />

            <Label htmlFor="goal-period">Periodo:</Label>
            <Select
              id="goal-period"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
              className="flex-1 min-w-0 px-2 py-1 text-xs bg-background"
            >
              {Object.values(GoalPeriod).map((goalPeriod) => (
                <option key={goalPeriod} value={goalPeriod}>
                  {GOAL_PERIOD_LABELS[goalPeriod]}
                </option>
              ))}
            </Select>
          </div>

          <Button
            size="sm"
            disabled={isPendingCreate || !amount || amount < 1}
            className="text-xs self-center"
            type="submit"
          >
            {isPendingCreate ? "Criando..." : "Criar"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default GoalList;
