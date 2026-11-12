import { WorkoutRecord } from "@habits/shared/workout";
import { useState } from "react";
import { formatDate } from "../../../lib/formDate";
import { cn } from "../../../lib/cn";

type Props = {
  records: WorkoutRecord[];
  isPending: boolean;
  error: string | null;
  unit?: string;
};

// Bloque presentational de records personales del hábito WORKOUT.
// El fetch vive en useWorkoutRecords; HabitDetail le pasa el estado.
// Colapsable (mismo patrón CSS de EntryForm): arranca cerrado para no
// ocupar espacio en cada detalle.
function WorkoutRecords({ records, isPending, error, unit }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col p-6 border-b border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between gap-2 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Records
        </span>
        <span
          className={cn(
            "text-xs text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        >
          ▾
        </span>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            inert={!open}
            className={cn(
              "flex flex-col gap-3 pt-3 transition-opacity duration-200",
              open ? "opacity-100" : "opacity-0",
            )}
          >
            {isPending && records.length === 0 && (
              <p className="text-xs text-slate-500">Cargando…</p>
            )}

            {error && (
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}

            {!isPending && !error && records.length === 0 && (
              <p className="text-xs text-slate-500">Sin records aún</p>
            )}

            {records.map((record) => (
              <div
                key={`${record.dayKey}-${record.exercise}-${record.maxWeight}-${record.reps}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="font-medium text-text">{record.exercise}</span>
                <span className="text-xs text-slate-500">
                  {record.maxWeight}
                  {unit ? ` ${unit}` : ""} × {record.reps}
                </span>
                <span className="text-xs text-slate-500 shrink-0">
                  {formatDate(record.dayKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutRecords;
