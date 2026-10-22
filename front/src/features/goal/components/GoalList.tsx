import { useEffect, useState } from "react";
import { useCreateGoal, useDeleteGoal, useGetGoals } from "../hooks/useGoal";
import { getGoalProgress } from "../api";
import { GoalPeriod, GoalProgressResponseDTO } from "@habits/shared/goal";
import { GOAL_PERIOD_LABELS } from "../lib/periodLabels";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { HabitType } from "@habits/shared/habit";
import { goalAmountUnitLabel } from "../lib/amountUnitLabels";
import { formatDate } from "../../../lib/formDate";

interface Props {
  habitId: string;
  habitType: HabitType;
  unit?: string;
}

function GoalList({ habitId, habitType, unit }: Props) {
  const [progressMap, setProgressMap] = useState<
    Record<string, GoalProgressResponseDTO>
  >({});
  const [progressError, setProgressError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | "">(1);
  const [period, setPeriod] = useState<GoalPeriod>(GoalPeriod.MONTH);
  const [showForm, setShowForm] = useState(false);

  const {
    mutate,
    data: goals,
    removeLocal,
    isPending: isPendingGet,
    error: errorGet,
  } = useGetGoals(habitId);
  const {
    mutate: mutateCreate,
    isPending: isPendingCreate,
    error: errorCreate,
  } = useCreateGoal();
  const { mutate: mutateDelete, isPending: isPendingDelete } = useDeleteGoal();

  useEffect(() => {
    mutate();
  }, [habitId]);

  useEffect(() => {
    if (!goals) return;
    let cancelled = false;
    setProgressError(null);
    Promise.all(
      goals.map((g) =>
        getGoalProgress({ habitId, goalId: g._id }).then(
          (p) => [g._id, p] as const,
        ),
      ),
    )
      .then((pairs) => {
        if (!cancelled) setProgressMap(Object.fromEntries(pairs));
      })
      .catch((e) => {
        if (!cancelled) setProgressError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [goals]);

  const handleSubmit = async () => {
    // `amount` puede venir como "" (campo vacío) o number: narrow antes de
    // enviarlo al DTO, que exige number.
    if (amount === "" || amount < 1) return;

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

  if (goals === null && isPendingGet) {
    return (
      <div className="relative p-4 rounded-xl border border-slate-200 bg-white animate-pulse">
        <div className="h-4 w-24 rounded bg-slate-200 mb-2" />
        <div className="h-3 w-40 rounded bg-slate-200/70 mb-3" />
        <div className="h-2 w-full rounded-full bg-slate-200/70" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Objetivos
        </span>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          type="button"
          aria-expanded={showForm}
          aria-controls="form-goal"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancelar" : "+ Novo objetivo"}
        </Button>
      </div>

      {goals && goals.length === 0 && !showForm && (
        <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl text-slate-500">
          <p className="text-sm">Ainda não tens nenhum objetivo.</p>
          <p className="text-xs mt-1">
            Cria o primeiro com o botão "+ Novo objetivo".
          </p>
        </div>
      )}

      {goals === null && !isPendingGet && errorGet ? (
        <div className="relative p-4 rounded-xl border border-slate-200 bg-white animate-pulse">
          <p role="alert" className="mt-2 text-xs text-red-600">
            {errorGet}
          </p>
        </div>
      ) : (
        ""
      )}

      {goals?.map((goal) => {
        const progress = progressMap[goal._id];

        if (!progress) {
          if (progressError) {
            return (
              <div
                key={goal._id}
                className="p-4 rounded-xl border border-slate-200 bg-white"
              >
                <p role="alert" className="text-xs text-red-600">
                  {progressError}
                </p>
              </div>
            );
          }

          // Skeleton mientras carga el progress — evita el "parpadeo" de null.
          return (
            <div
              key={goal._id}
              className="relative p-4 rounded-xl border border-slate-200 bg-white animate-pulse"
            >
              <div className="h-4 w-24 rounded bg-slate-200 mb-2" />
              <div className="h-3 w-40 rounded bg-slate-200 mb-3" />
              <div className="h-2 w-full rounded-full bg-slate-200" />
            </div>
          );
        }

        const done = progress.pct >= 100;

        return (
          <div
            key={goal._id}
            className="group/goal relative p-4 rounded-xl border border-slate-200 bg-white"
          >
            {/* Delete — aparece al hover, arriba a la derecha */}
            <Button
              variant="danger"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover/goal:opacity-100 transition-opacity text-xs focus-visible:opacity-100"
              disabled={isPendingDelete}
              onClick={() => handleDelete(goal._id)}
              aria-label="eliminar-objetivo"
            >
              ×
            </Button>

            {/* Encabezado: período protagonista, fechas en segundo plano */}
            <div className="flex items-baseline justify-between pr-6">
              <span className="text-sm font-medium text-text">
                {GOAL_PERIOD_LABELS[goal.period]}
              </span>
              <span className="text-xs text-slate-500">
                {formatDate(progress.periodStart)} –{" "}
                {formatDate(progress.periodEnd)}
              </span>
            </div>

            {/* Contador + porcentaje destacado */}
            <div className="flex items-baseline justify-between mt-1 mb-2">
              <span className="text-xs text-slate-500">
                {progress.current} / {progress.amount}{" "}
                {goalAmountUnitLabel(habitType, unit)}
              </span>
              <span
                className={`text-lg font-bold ${done ? "text-emerald-500" : "text-primary"}`}
              >
                {`${Math.min(progress.pct, 100)}%`}
              </span>
            </div>

            {/* Barra de progreso — transición suave + color de éxito al 100% */}
            <div className="h-2 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
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
          id="form-goal"
        >
          {!isPendingCreate && errorCreate ? (
            <div className="relative p-4 rounded-xl border border-slate-200 bg-white animate-pulse">
              <p role="alert" className="mt-2 text-xs text-red-600">
                {errorCreate}
              </p>
            </div>
          ) : (
            ""
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="goal-amount">
                Valor ({goalAmountUnitLabel(habitType, unit)}):
              </Label>

              <Input
                id="goal-amount"
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => {
                  setAmount(
                    e.target.value === "" ? "" : Number(e.target.value),
                  );
                }}
                className="flex-1 min-w-0 px-2 py-1 text-sm bg-white"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="goal-period">Período:</Label>
              <Select
                id="goal-period"
                required
                value={period}
                onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
                className="flex-1 min-w-0 px-2 py-1 text-sm bg-white"
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
              className="text-xs col-span-full justify-self-end"
              type="submit"
            >
              {isPendingCreate ? "Criando..." : "Criar"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default GoalList;
