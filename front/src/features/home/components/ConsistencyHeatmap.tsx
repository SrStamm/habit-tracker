import { useMemo, useState } from "react";
import { Entry } from "@habits/shared/entry";
import { Habit } from "@habits/shared/habit";
import HeatmapGrid from "../../habit/components/HeatmapGrid";
import WeekLabels from "../../habit/components/WeekLabels";
import Legend from "../../habit/components/Legend";
import { Cell } from "../../entry/lib/buildHeatmap";
import { buildConsistencyHeatmap } from "../lib/buildConsistencyHeatmap";
import { fmtDayKey } from "../../../lib/fmtDayKey";
import { shiftDayKey } from "@habits/shared/dayKey";
import { formatDate } from "../../../lib/formDate";

type Props = {
  habits: Habit[];
  entries: Entry[];
};

function ConsistencyHeatmap({ habits, entries }: Props) {
  const [selectedDate, setSelectedDate] = useState<Cell | null>(null);

  // Janela fixa de 90 dias — mesma fórmula do fetch do Home. Aritmética de
  // calendário puro: nem DST nem zona do navegador movem o borde.
  const { from, to } = useMemo(() => {
    const to = fmtDayKey(new Date());
    return { from: shiftDayKey(to, -90), to };
  }, []);

  const weeks = useMemo(
    () => buildConsistencyHeatmap(habits, entries, from, to),
    [habits, entries, from, to],
  );

  // Sem hábitos ativos não há nada significativo a mostrar.
  if (habits.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-text">Consistência</h2>
        <p className="text-xs text-text-muted">Últimos 90 dias</p>
      </div>

      {/* p-2 (no solo pb-2): overflow-x fuerza overflow-y a auto y recortaría
          el ring de hover de la primera fila. */}
      <div className="overflow-x-auto p-2">
        <div className="flex gap-2 w-fit mx-auto mb-2">
          <WeekLabels />

          <HeatmapGrid weeks={weeks} onCellSelect={setSelectedDate} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
        <Legend />

        {selectedDate && (
          <div className="text-right text-text">
            <span className="font-medium">{formatDate(selectedDate.date)}: </span>
            <span className="text-primary font-semibold">
              {selectedDate.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsistencyHeatmap;
