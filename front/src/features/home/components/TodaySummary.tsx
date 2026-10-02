import { Entry } from "@habits/shared/entry";
import { Habit, HabitType } from "@habits/shared/habit";
import { useMemo } from "react";
import { isCompleted } from "../../habit/lib/isCompleted";
import { Button } from "../../../components/ui/Button";
import { DURATION_OPTIONS_LABELS } from "../../habit/lib/durationOptionsLabels";

type Props = {
  habits: Habit[];
  entries: Entry[];
  isPending: boolean;
  error: string | null;
  onRefresh: () => void;
};

export default function TodaySummary({
  habits,
  entries,
  isPending,
  error,
  onRefresh,
}: Props) {
  const entriesByHabit = useMemo(
    () => new Map(entries.map((e) => [e.habitId, e])),
    [entries],
  );

  const total = habits.length;
  const completedHabits = habits.filter((h) =>
    isCompleted(h, entriesByHabit.get(h._id)),
  );
  const done = completedHabits.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const pendingHabits = habits.filter(
    (h) => !isCompleted(h, entriesByHabit.get(h._id)),
  );
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* 1. Header & Barra de Progreso */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text">Resumo de Hoje</h2>

            {!isPending && !error && (
              <p className="text-xs text-text-muted">
                {done} de {total} hábitos cumpridos hoje
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isPending && !error && (
              <span className="text-xl font-black text-primary">{pct}%</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isPending}
              className="text-xs"
            >
              {isPending ? "..." : "🔄 Atualizar"}
            </Button>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            <p>No se pudo cargar el resumen.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              className="mt-2 text-xs"
            >
              Reintentar
            </Button>
          </div>
        ) : isPending ? (
          // Skeleton — evita el parpadeo a 0%
          <div className="animate-pulse flex flex-col gap-3" aria-busy="true">
            <div className="h-3 w-full rounded-full bg-border/60" />
            <div className="h-4 w-1/3 rounded bg-border/60" />
            <div className="h-16 rounded-xl bg-border/40" />
          </div>
        ) : (
          <>
            {/* Barra de progreso */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-border/40">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* 2. Secção de Hábitos Pendientes */}
            <div className="flex flex-col gap-3 mt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Faltam por completar ({pendingHabits.length})
              </h3>

              {total === 0 ? (
                <p className="text-sm text-text-muted">
                  Cria o teu primeiro hábito...
                </p>
              ) : pendingHabits.length === 0 ? (
                <div className="rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-4 text-center text-sm text-emerald-600">
                  🎉 Todos os hábitos do dia foram concluídos!
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {pendingHabits.map((habit) => {
                    const currentEntry = entriesByHabit.get(habit._id);

                    return (
                      <div
                        key={habit._id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5 shadow-xs"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-sm font-medium text-text">
                            {habit.name}
                          </span>
                        </div>

                        {habit.type === HabitType.BOOLEAN ? (
                          <span className="text-xs text-text-muted">
                            Pendente
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted shrink-0">
                            {currentEntry?.value ?? 0} / {habit.target}{" "}
                            {habit.type === HabitType.DURATION
                              ? DURATION_OPTIONS_LABELS[habit.unit]
                              : habit.unit}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
