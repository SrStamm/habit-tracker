import { useEffect, useState } from "react";
import { useCreateGoal, useDeleteGoal, useGetGoals } from "../hooks/useGoal";
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
  const [amount, setAmount] = useState<number>(1);
  const [period, setPeriod] = useState<GoalPeriod>(GoalPeriod.MONTH);
  const [showForm, setShowForm] = useState(false);

  const { mutate, data: goals, removeLocal } = useGetGoals(habitId);
  const { mutate: mutateCreate, isPending: isPendingCreate } = useCreateGoal();
  const { mutate: mutateDelete, isPending: isPendingDelete } = useDeleteGoal();

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

  const handleDelete = async (goalId: string) => {
    const deleted = await mutateDelete({ habitId, goalId });
    if (deleted) removeLocal(goalId);
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

      {goals && goals.length === 0 && !showForm && (
        <div className="text-center py-6 border border-dashed border-border rounded-xl text-text-muted">
          <p className="text-sm">Ainda não tens nenhum objetivo.</p>
          <p className="text-xs mt-1">
            Cria o primeiro com o botão "+ Novo objetivo".
          </p>
        </div>
      )}

      {goals?.map((goal) => {
        const progress = progressMap[goal._id];

        if (!progress) {
          // Skeleton mientras carga el progress — evita el "parpadeo" de null.
          return (
            <div
              key={goal._id}
              className="relative p-4 rounded-xl border border-border/40 bg-card animate-pulse"
            >
              <div className="h-4 w-24 rounded bg-muted/60 mb-2" />
              <div className="h-3 w-40 rounded bg-muted/40 mb-3" />
              <div className="h-2 w-full rounded-full bg-muted/40" />
            </div>
          );
        }

        const pct = Math.round(progress.pct);
        const done = progress.pct >= 100;

        return (
          <div
            key={goal._id}
            className="group/goal relative p-4 rounded-xl border border-border/40 bg-card"
          >
            {/* Delete — aparece al hover, arriba a la derecha */}
            <Button
              variant="danger"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover/goal:opacity-100 transition-opacity text-xs"
              disabled={isPendingDelete}
              onClick={() => handleDelete(goal._id)}
            >
              ×
            </Button>

            {/* Encabezado: período protagonista, fechas en segundo plano */}
            <div className="flex items-baseline justify-between pr-6">
              <span className="text-sm font-medium text-text">
                {GOAL_PERIOD_LABELS[goal.period]}
              </span>
              <span className="text-xs text-text-muted">
                {progress.periodStart} – {progress.periodEnd}
              </span>
            </div>

            {/* Contador + porcentaje destacado */}
            <div className="flex items-baseline justify-between mt-1 mb-2">
              <span className="text-xs text-text-muted">
                {progress.current} / {progress.amount}
              </span>
              <span
                className={`text-lg font-bold ${done ? "text-emerald-500" : "text-primary"}`}
              >
                {pct}%
              </span>
            </div>

            {/* Barra de progreso — transición suave + color de éxito al 100% */}
            <div className="h-2 w-full rounded-full bg-background border border-border/40 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${done ? "bg-emerald-500" : "bg-primary"}`}
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

            <Label htmlFor="goal-period">Período:</Label>
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
