import { Entry } from "@habits/shared/entry";
import { DurationOptions, Habit, HabitType } from "@habits/shared/habit";
import { isCompleted } from "../../habit/lib/isCompleted";
import { Button } from "../../../components/ui/Button";
import { DURATION_OPTIONS_LABELS } from "../../habit/lib/durationOptionsLabels";

type Props = {
  habits: Habit[];
  entriesByHabit: Map<string, Entry>;
  isPending: boolean;
  error: string | null;
  onRefresh: () => void;
};

export default function TodaySummary({
  habits,
  entriesByHabit,
  isPending,
  error,
  onRefresh,
}: Props) {
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
            <button
              onClick={onRefresh}
              disabled={isPending}
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-slate-100 hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Atualizar resumo"
              title="Atualizar resumo"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
            </button>
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
            <div className="flex flex-col gap-3 ">
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
                <div className="flex flex-col divide-y divide-border/40 gap-1.5">
                  {pendingHabits.map((habit) => {
                    const currentEntry = entriesByHabit.get(habit._id);

                    return (
                      <div
                        key={habit._id}
                        className="flex items-center gap-3 py-2"
                      >
                        <span
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-border"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
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
                            {habit.target
                              ? `${currentEntry?.value ?? 0} / ${habit.target}`
                              : "Pendente"}{" "}
                            {habit.type === HabitType.DURATION && habit.unit
                              ? DURATION_OPTIONS_LABELS[
                                  habit.unit as DurationOptions
                                ]
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
