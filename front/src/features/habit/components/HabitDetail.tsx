import { Habit, HabitType } from "@habits/shared/habit";
import { Entry } from "@habits/shared/entry";
import { Tag } from "../../../components/ui/Tag";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { buildHeatmap, Cell } from "../../entry/lib/buildHeatmap";
import { fmtDayKey } from "../../../lib/fmtDayKey";
import WeekLabels from "./WeekLabels";
import HeatmapGrid from "./HeatmapGrid";
import { HabitTypeBadge } from "./HabitTypeBadge";
import Legend from "./Legend";
import { useEffect, useMemo, useRef, useState } from "react";
import GoalList from "../../goal/components/GoalList";
import { formatDate } from "../../../lib/formDate";
import KpiCard from "./KpiCard";
import EntryForm from "./EntryForm";

type Props = {
  habit: Habit;
  entries: Entry[];
  streak?: number;
  onEntrySaved?: () => void;
  onArchive: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
};

function HabitDetail({
  habit,
  streak,
  entries,
  onEntrySaved,
  onArchive,
  onEdit,
}: Props) {
  const todayKey = fmtDayKey(new Date());

  const [selectedDate, setSelectedDate] = useState<string>();
  const [days, setDays] = useState<number>(90);
  const [dayKey, setDayKey] = useState<string>(todayKey);
  const [showEntryForm, setShowEntryForm] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuOpenRef = useRef(menuOpen);

  const today = new Date();
  const hace90d = new Date();
  hace90d.setDate(hace90d.getDate() - days);

  const weeks = buildHeatmap(
    entries,
    habit.type,
    fmtDayKey(hace90d),
    fmtDayKey(today),
    undefined,
    habit.unit ?? undefined,
  );

  const selectedLabel = weeks
    .flat()
    .find((c) => c?.date === selectedDate)?.label;

  // Total del período: recorte de entries según el rango del heatmap.
  // BOOLEAN cuenta días cumplidos; QUANTITY/DURATION suman value en la
  // unidad cruda del hábito (no hay conversión en el front).
  const periodTotal = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const cutoff = fmtDayKey(start);
    const inRange = entries.filter(
      (e) => e.dayKey >= cutoff && e.dayKey <= todayKey,
    );

    if (habit.type === HabitType.BOOLEAN) {
      return inRange.filter((e) => e.completed === true).length;
    }

    return inRange.reduce((sum, e) => sum + (e.value ?? 0), 0);
  }, [entries, days, habit.type, todayKey]);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!menuOpenRef.current) return;
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!menuOpenRef.current) return;
      if (e.key !== "Escape") return;

      e.preventDefault();
      e.stopImmediatePropagation();
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const syncDay = (next: string) => {
    if (!next || next > todayKey) return;
    setDayKey(next);
  };

  const onCellSelect = (cell: Cell) => {
    setSelectedDate(cell.date);
    syncDay(cell.date);
    setShowEntryForm(true);
  };

  return (
    <div>
      {/*
      # Encabezado y Contexto
      - Información identitaria: Nombre, categoría y tipo
      - Meta u objetivo configurado
      - Métricas rápidas:
        # TODO: Racha actual vs Mejor racha histórica
        # TODO: Porcentaje global de cumplimiento (ej: 78% en los últimos 3 meses)
    */}

      <div className="flex flex-col gap-6 p-6 bg-white border-b border-slate-200">
        {/* Header: Metadata + Título */}
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <HabitTypeBadge type={habit.type} />
              {habit.category && (
                <Tag
                  className="border-slate-200 text-slate-500"
                  variant="outline"
                >
                  {habit.category}
                </Tag>
              )}
            </div>

            <h2 className="text-2xl font-bold text-text">{habit.name}</h2>

            {habit.target && (
              <p className="text-xs text-slate-500">
                Meta:{" "}
                <span className="font-medium text-text">
                  {habit.target} {habit.unit ?? ""}
                </span>
              </p>
            )}
          </div>

          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="rounded-lg px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
            >
              ⋯
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 z-10 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(habit);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                >
                  Editar
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onArchive(habit._id);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-red-50"
                >
                  Arquivar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tarjetas de Métricas (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <KpiCard
            label="Racha actual"
            value={
              <>
                {streak && streak > 0 ? "🔥" : "💤"} {streak ?? 0}{" "}
                {streak === 1 ? "día" : "días"}
              </>
            }
            valueClassName="text-amber-500 flex items-center gap-1.5"
          />

          {/* Objetivo / Meta */}
          <KpiCard
            label="Meta diaria"
            value={
              habit.target ? `${habit.target} ${habit.unit ?? ""}` : "Sin meta"
            }
          />

          {/* Total del Período (últimos N días del selector del heatmap) */}
          <KpiCard
            label="Total do Período"
            value={
              habit.type === HabitType.BOOLEAN
                ? `${periodTotal} ${periodTotal === 1 ? "dia" : "dias"}`
                : `${periodTotal} ${habit.unit ?? ""}`.trim()
            }
            valueClassName="text-primary"
          />
        </div>
      </div>

      {/*
      # Visualización de Consistencia
      - Heatmap interactivo: últimos 90 días.
      - Tooltip al hacer hover/click en un día: ver fecha exacta y valor registrado
      */}

      <div className="flex flex-col gap-3 p-6 border-b border-slate-200">
        <div className="flex flex-row items-center gap-2 justify-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Histórico de Actividade
          </span>
          <Select
            className="py-0.5 w-auto text-xs px-2"
            onChange={(e) => setDays(Number(e.target.value))}
            value={days}
          >
            <option value={7}>1 semana</option>
            <option value={15}>15 días</option>
            <option value={30}>1 mês</option>
            <option value={90}>3 meses</option>
            <option value={180}>6 meses</option>
            <option value={270}>9 meses</option>
            <option value={365}>12 meses</option>
          </Select>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 w-fit mx-auto mb-2">
            <WeekLabels />

            <HeatmapGrid weeks={weeks} onCellSelect={onCellSelect} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
          <Legend />

          {selectedDate && (
            <div className="text-right text-text">
              <span className="font-medium">{formatDate(selectedDate)}: </span>
              <span className="text-primary font-semibold">
                {selectedLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Entrada
          </span>

          {!showEntryForm && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              type="button"
              onClick={() => setShowEntryForm(true)}
            >
              Registrar / Modificar data
            </Button>
          )}
        </div>

        {/* Colapsable: CSS only, sin librería */}
        <EntryForm
          habit={habit}
          entries={entries}
          dayKey={dayKey}
          setDayKey={setDayKey}
          todayKey={todayKey}
          showEntryForm={showEntryForm}
          setShowEntryForm={setShowEntryForm}
          onEntrySaved={onEntrySaved}
        />
      </div>

      <GoalList habitId={habit._id} habitType={habit.type} unit={habit.unit} />
    </div>
  );
}

export default HabitDetail;
